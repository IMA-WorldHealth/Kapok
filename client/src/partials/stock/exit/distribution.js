angular.module('bhima.controllers')
.controller('stock.distribution', [
  '$scope',
  '$q',
  '$routeParams',
  '$location',
  'validate',
  'connect',
  'messenger',
  'util',
  'uuid',
  '$translate',
  function ($scope, $q, $routeParams, $location, validate, connect, messenger, util, uuid, $translate) {
    var session = $scope.session = {
      // FIXME
      index : -1,
      state : null,
      depot : $routeParams.depotId,
      lotSelectionSuccess : false,
      lotSelectionFailure : false
    };
    var dependencies = {};

    // Test for module organised into step structure
    var moduleDefinition = $scope.moduleDefinition = [
      {
        title : $translate.instant('DISTRIBUTION.LOCATE_PATIENT'),
        template : 'patientSearch.tmpl.html',
        method : null
      },
      {
        title : $translate.instant('DISTRIBUTION.SLECT_PRESCRIPTION'),
        template : 'selectSale.tmpl.html',
        method : null
      },
      {
        title : $translate.instant('DISTRIBUTION.ALLOCATE_MEDECINE'),
        template : 'allocateLot.tmpl.html',
        method : null
      }
    ];

    var stock = {
      NONE : {
        alert : $translate.instant('DISTRIBUTION.NONE'),
        icon : 'glyphicon-remove-sign error'
      },
      LIMITED_STOCK : {
        alert :  $translate.instant('DISTRIBUTION.LIMITED_STOCK'),
        icon : 'glyphicon-info-sign warn'
      },
      EXPIRED : {
        alert : $translate.instant('DISTRIBUTION.EXPIRED'),
        icon : 'glyphicon-info-sign error'
      }
    };

    dependencies.ledger = {};

    moduleStep();

    function initialiseDistributionDetails(patient) {
      dependencies.ledger.query = '/ledgers/debitor/' + patient.debitor_uuid;
      session.patient = patient;
      validate.process(dependencies).then(startup);
    }

    function startup(model) {
      angular.extend($scope, model);
      $scope.ledger.data = $scope.ledger.data.filter(function (data) { return data.is_distributable[0] === 1; });
      moduleStep();
    }

    function moduleStep() {
      session.index += 1;
      session.state = moduleDefinition[session.index];
    }

    function selectSale(sale) {
      session.sale = sale;

      moduleStep();

      getSaleDetails(sale).then(function (saleDetails) {
        var detailsRequest = [];
        session.sale.details = saleDetails.data;

        detailsRequest = session.sale.details.map(function (saleItem) {
          return connect.req('inventory/depot/' + session.depot + '/drug/' + saleItem.code);
        });

        $q.all(detailsRequest).then(function (result) {
          session.sale.details.forEach(function (saleItem, index) {
            var itemModel = result[index];
            if (itemModel.data.length) { saleItem.lots = itemModel; }
          });


          recomendLots(session.sale.details);

          session.lotSelectionSuccess = verifyValidLots(session.sale.details);
        })
        .catch(function (error) {
          messenger.error(error);
        });
      });
    }

    function recomendLots(saleDetails) {
      // Corner cases
      // - ! Lot exists but does not have enough quantity to provide medicine
      // - No lots exist, warning status
      // - ! Lot exists but is expired, stock administrator
      // - Lot exists with both quantity and expiration date

      saleDetails.forEach(function (saleItem) {
        var validUnits = 0;
        var sessionLots = [];

        // Ignore non consumable items
        if (!saleItem.consumable) { return; }

        // Check to see if any lots exist (expired stock should be run through the stock loss process)
        if (!saleItem.lots) {
          saleItem.stockStatus = stock.NONE;
          return;
        }

        // If lots exist, order them by experiation and quantity
        saleItem.lots.data.sort(orderLotsByUsability);
        saleItem.lots.recalculateIndex();

        // Iterate through ordered lots and determine if there are enough valid units
        saleItem.lots.data.forEach(function (lot) {
          var expired = new Date(lot.expiration_date) < new Date();

          if (!expired) {

            var unitsRequired = saleItem.quantity - validUnits;

            if (unitsRequired > 0) {
              // Add lot to recomended lots
              var lotQuantity = (lot.quantity > unitsRequired) ? unitsRequired : lot.quantity;
              sessionLots.push({details : lot, quantity : lotQuantity});
              validUnits += lotQuantity;

            }
          } else {
            messenger.danger('Lot ' + lot.lot_number + $translate.instant('DISTRIBUTION.HAS_EXPIRED'), true);
          }
        });

        if (validUnits < saleItem.quantity) {
          saleItem.stockStatus = stock.LIMITED_STOCK;
        }

        if (sessionLots.length) { saleItem.recomendedLots = sessionLots; }
      });
    }

    function orderLotsByUsability(a, b) {
      // Order first by expiration date, then by quantity
      var aDate = new Date(a.expirationDate),
          bDate = new Date(b.expirationDate);

      if (aDate === bDate) {
        return (a.quantity < b.quantity) ? -1 : (a.quantity > b.quantity) ? 1 : 0;
      }

      return (aDate < bDate) ? -1 : 1;
    }

    function verifyValidLots(saleDetails) {
      var invalidLots = false;

      //Ensure each item has a lot
      invalidLots = saleDetails.some(function (item) {
        // ignore non consumables (FIXME better way tod do this across everything)
        if (!item.consumable) { return false; }

        // FIXME hack - if a status has been reported, cannot be submitted
        if (item.stockStatus) { return true; }
      });

      // Update on failed attempt - EVERY validation
      session.lotSelectionFailure = invalidLots;
      return !invalidLots;
    }

    function getSaleDetails(sale) {
      var query = {
        tables : {
          sale_item : {
            columns : ['sale_uuid', 'uuid', 'inventory_uuid', 'quantity']
          },
          inventory : {
            columns : ['code', 'text', 'consumable']
          }
        },
        where : ['sale_item.sale_uuid=' + sale.inv_po_id],
        join : ['sale_item.inventory_uuid=inventory.uuid']
      };

      return connect.req(query);
    }

    function submitConsumption() {
      var submitItem = [];
      var consumption_patients = [];
      if (!session.lotSelectionSuccess) { return messenger.danger('Cannot verify lot allocation'); }
      session.sale.details.forEach(function (consumptionItem) {

        if (!angular.isDefined(consumptionItem.recomendedLots)) { return; }

        consumptionItem.recomendedLots.forEach(function (lot) {
          var consumption_uuid = uuid();
          submitItem.push({
            uuid : consumption_uuid,
            depot_uuid : session.depot,
            date : util.convertToMysqlDate(new Date()),
            document_id : consumptionItem.sale_uuid,
            tracking_number : lot.details.tracking_number,
            quantity : lot.quantity
          });

          consumption_patients.push({
            uuid : uuid(),
            consumption_uuid : consumption_uuid,
            sale_uuid : session.sale.inv_po_id,
            patient_uuid : session.patient.uuid
          });
        });
      });
      connect.basicPut('consumption', submitItem)
      .then(function (){
        return connect.basicPut('consumption_patient', consumption_patients);
      })
      .then(function (res) {
        return connect.fetch('/journal/distribution_patient/' + session.sale.inv_po_id);
      })
      .then(function () {
        $location.path('/invoice/consumption/' + session.sale.inv_po_id);
      })
      .catch(function (error) {
        messenger.error(error);
      });
    }

    $scope.selectSale = selectSale;
    $scope.initialiseDistributionDetails = initialiseDistributionDetails;
    $scope.submitConsumption = submitConsumption;
  }
]);
