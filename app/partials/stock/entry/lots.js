angular.module('kpk.controllers')
.controller('stock.lots', [
  '$scope',
  '$location',
  'store',
  'appstate',
  'messenger',
  'connect',
  'precision',
  'uuid',
  function ($scope, $location, Store, appstate, messenger, connect, precision, uuid) {

    // TODOs
    // . Ensure that tracking numbers are unique.
    // . Clean up totalling code
    // . Clean up transition code between modules (no angular.extend())

    var session = $scope.session = {
      lots : new Store({ identifier : 'uuid', data : [] }),
      totals : new Store({ identifier : 'code', data : [] })
    };

    var triage = $scope.triage = { codes : [] };

    function Lot () {
      this.id = uuid();
      this.inventory_code = null;
      this.purchase_price = 0;
      this.expiration_date = new Date();
      this.entry_date = new Date();
      this.lot_number = 0;
      this.purchase_order_uuid = null;
      this.tracking_number = 0;
      this.quantity = 0;
      this.active = true;
      this.valid = true;
    }

    function startup (db) {
      if (!db) { return messenger.danger('ERR.NOT_FOUND'); }
      session.lots.post(new Lot());
      angular.extend(session, db);

      // perform triage of the data
      session.order.data.forEach(function (drug) {
        if (triage.codes.indexOf(drug.code) < 0) {
          triage.codes.push(drug.code);
        }
      });
    }

    function error (err) {
      messenger.error(err);
    }

    startup(appstate.get('stock.lots'));

    $scope.add = function add () {
      session.lots.post(new Lot());
    };

    $scope.remove = function remove (id) {
      session.lots.remove(id);
    };

    $scope.edit = function edit (id) {
      session.lots.get(id).active = true;
    };

    $scope.commit = function commit (id) {
      var lot = session.lots.get(id),
          ref = session.order.get(lot.inventory_code);

      lot.active = false;
      lot.purchase_order_uuid = session.purchase_uuid;

      // update total
      var old = session.totals.get(lot.inventory_code);
      if (!!old) {
        session.totals.put({ code : lot.inventory_code , total : lot.quantity + old.total });
      } else {
        session.totals.post({ code: lot.inventory_code, total : lot.quantity });
      }

      // calculate using the actual purchase unit price
      var unitPrice = precision.round(ref.purchase_price / ref.quantity);
      lot.purchase_price = precision.round(unitPrice * lot.quantity);

      lot.valid = validateLot(lot);
    };

    $scope.back = function back () {
      $location.path('/stock/entry');
    };

    $scope.setQuantity = function setQuantity (lot) {
      var reference, max, code = lot.inventory_code;

      session.order.data.forEach(function (drug) {
        if (drug.code === lot.inventory_code) { reference = drug; }
      });

      var saved = session.totals.get(code);
      lot.quantity = !!saved ? reference.quantity - saved.total : reference.quantity;
    };

    function validateLot (lot) {
      var valid = {};
      valid.quantity = !Number.isNaN(Number(lot.quantity));
      valid.expiration_date = !Number.isNaN(new Date(lot.expiration_date).getDate());
      valid.tracking_number = !!lot.tracking_number;
      valid.purchase_order_uuid = !!lot.purchase_order_uuid;
      valid.inventory_code = triage.codes.indexOf(lot.inventory_code) > -1;

      return valid.quantity && valid.expiration_date &&
        valid.tracking_number && valid.purchase_order_uuid &&
        valid.inventory_code;
    }

    $scope.review = function review () {
      var hasErrors = session.lots.data.every(function (lot) {
        return !!lot.valid;
      });

      if (!hasErrors) { return messenger.danger('Selection has errors'); }

      var isBalanced = session.order.data.every(function (o) {
        var total = session.totals.get(o.code).total;
        return o.quantity === total;
      });

      if (!isBalanced) { return messenger.danger('Allocated amounts do not match purchase order amounts.'); }

      $location.path('/stock/entry/review');
    };

  }
]);
