angular.module('bhima.controllers')
.controller('receipt.sale', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}, total : {}};
    $scope.updateCurrency = updateCurrency;

    dependencies.recipient = {
      required: true,
      query : {
        tables: {
          'patient' : {
            columns: ['first_name', 'last_name', 'dob', 'reference', 'registration_date']
          },          
          'debitor' : {
            columns: ['text']
          },
          'debitor_group' : {
            columns : ['name', 'is_convention'],
          },
          'project' : {
            columns : ['abbr']
          }
        },        
        join : [
          'patient.debitor_uuid=debitor.uuid',
          'debitor.group_uuid=debitor_group.uuid',
          'patient.project_id=project.id'
        ]
      }
    };

    dependencies.ledger = {
      identifier: 'inv_po_id'
    };

    dependencies.saleRecords = {
      required: true,
      query: {
        tables: {
          'sale' : {
            columns: ['uuid', 'cost', 'currency_id', 'debitor_uuid', 'seller_id', 'invoice_date', 'note', 'project_id', 'reference']
          },
          sale_item : {
            columns: ['quantity', 'debit', 'credit', 'transaction_price']
          },
          inventory : {
            columns: ['code', 'text']
          },
          'currency' : {
            columns : ['id', 'symbol']
          }          
        },
        join: ['sale.uuid=sale_item.sale_uuid','sale_item.inventory_uuid=inventory.uuid', 'sale.currency_id=currency.id']
      }
    };

    dependencies.currency = {
      query :{
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }        
      }
    };

    function updateCurrency (currency) {
      var totals = model.total,
        saleRecord = model.saleRecords,
        saleRecords = model.saleRecords[0],
        doConvert = model.common.doConvert,
        convert = model.common.convert,
        ledgers = model.ledger;

      
      totals.localeCost = doConvert(saleRecords.cost, currency, saleRecords.invoice_date);

      if (ledgers)  {
        totals.localeBalance = doConvert(ledgers.balance, currency, saleRecords.invoice_date);
        ledgers.localeCredit = doConvert(model.ledger.credit, currency, saleRecords.invoice_date);
      }

      totals.localeTotalSum = model.common.convert(totals.totalSum, currency, saleRecords.invoice_date);

      saleRecord.forEach(function (item) {
        item.localeTransaction = doConvert(item.transaction_price, currency, saleRecords.invoice_date);
        item.localeCost = doConvert((item.credit - item.debit), currency, saleRecords.invoice_date);
      });
    }

    function sum (a,b) { return a + b.cost; }

    function getRecipientDetail(result) {
      model.currency = result.currency;
      model.initialCurrency = model.selectedCurrency = model.currency.get(model.common.enterprise.currency_id);
      var debtor_uuid = result.saleRecords.data[0].debitor_uuid;
      dependencies.recipient.query.where = ['patient.debitor_uuid=' + debtor_uuid];
      dependencies.ledger.query = 'ledgers/debitor/' + debtor_uuid;
      return validate.process(dependencies, ['recipient','ledger']);
    }

    function buildInvoice(invoiceModel) {      
      model.saleRecords = invoiceModel.saleRecords.data;
      model.total.totalSum = model.saleRecords.reduce(sum, 0) || 0;
      model.ledger = invoiceModel.ledger.get(model.saleRecords[0].uuid);
      model.recipient = invoiceModel.recipient.data[0];
      updateCost(model.initialCurrency.id);
    }

    function updateCost(currency_id) {
      var totals = model.total,
        saleRecord = model.saleRecords,
        saleRecords = model.saleRecords[0],
        doConvert = model.common.doConvert,
        convert = model.common.convert,
        ledgers = model.ledger;
        
      totals.localeCost = doConvert(saleRecords.cost, currency_id, saleRecords.invoice_date);

      if (ledgers)  {
        totals.localeBalance = doConvert(ledgers.balance, currency_id, saleRecords.invoice_date);
        ledgers.localeCredit = doConvert(model.ledger.credit, currency_id, saleRecords.invoice_date);
      }

      totals.localeTotalSum = convert(totals.totalSum, currency_id, saleRecords.invoice_date);

      saleRecord.forEach(function (item) {
        item.localeTransaction = doConvert(item.transaction_price, currency_id, saleRecords.invoice_date);
        item.localeCost = doConvert((item.credit - item.debit), currency_id, saleRecords.invoice_date);
      });
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data[0];
        model.common.enterprise = values.enterprise.data[0];
        model.common.convert = values.convert;
        model.common.doConvert = values.doConvert;
        dependencies.saleRecords.query.where = ['sale.uuid=' + values.invoiceId];
        validate.process(dependencies, ['saleRecords', 'currency'])
        .then(getRecipientDetail)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});     
    });    
  }
]);