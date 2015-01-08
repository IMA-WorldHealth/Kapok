// TODO Debtor table currently has no personal information - this strictly ties debtors to patients
// (or some existing table) - a reverse lookup from debtor / creditor ID to recipient is needed.
angular.module('bhima.controllers')
.controller('receipts', [
  '$scope',
  '$routeParams',
  '$q',
  'validate',
  'exchange',
  'appstate',
  'connect',
  function ($scope, $routeParams, $q, validate, exchange, appstate, connect) {
    var templates,
      dependencies = {},
      origin = $scope.origin = $routeParams.originId,
      invoiceId = $routeParams.invoiceId,
      commonData = $q.defer(),
      session = $scope.session = {};

    if (!(origin && invoiceId)) { throw new Error('Invalid parameters'); }

    appstate.set('receipts.commonData', commonData.promise);

    dependencies.location = {};
    dependencies.enterprise = {
      query : {
        tables : {
          'enterprise' : {columns : ['id', 'name', 'phone', 'email', 'location_id', 'currency_id' ]},
          'project'    : {columns : ['name', 'abbr']}
        },
        join : ['enterprise.id=project.enterprise_id']
      }
    };

    templates = {
      'caution' : {
        url : '/partials/receipts/templates/receipt_caution.html'
      },
      'transfer' : {
        url : '/partials/receipts/templates/receipt_transfer.html'
      },
      'convention' : {
        url : '/partials/receipts/templates/receipt_convention.html'
      },
      'generic_income' : {
        url : '/partials/receipts/templates/receipt_generic_income.html'
      },
      'generic_expense' : {
        url : '/partials/receipts/templates/receipt_generic_expense.html'
      },
      'purchase' : {
        url : '/partials/receipts/templates/receipt_purchase.html'
      },
      'indirect_purchase' : {
        url : '/partials/receipts/templates/receipt_indirect_purchase.html'
      },
      'confirm_indirect_purchase' : {
        url : '/partials/receipts/templates/receipt_confirm_indirect_purchase.html'
      },
      'confirm_direct_purchase' : {
        url : '/partials/receipts/templates/receipt_confirm_direct_purchase.html'
      },
      'consumption' : {
        url : '/partials/receipts/templates/receipt_consumption.html'
      },
      'tax_payment' : {
        url : '/partials/receipts/templates/receipt_tax_payment.html'
      },
      'cotisation_paiement' : {
        url : '/partials/receipts/templates/receipt_cotisation_paiement.html'
      },
      'payslip' : {
        url : '/partials/receipts/templates/receipt_payslip.html'
      },
      'payroll' : {
        url : '/partials/receipts/templates/receipt_payroll.html'
      },
      'sale' : {
        url : '/partials/receipts/templates/receipt_sale.html'
      },
      'cash' : {
        url : '/partials/receipts/templates/receipt_cash.html'
      },
      'credit' : {
        url : '/partials/receipts/templates/receipt_credit_note.html'
      },
      'service_distribution' : {
        url : '/partials/receipts/templates/receipt_service_distribution.html'
      },
      'patient' : {
        url : '/partials/receipts/templates/receipt_patient.html'
      },
      'loss' : {
        url : '/partials/receipts/templates/receipt_loss.html'
      },
      'movement' : {
        url : '/partials/receipts/templates/receipt_movement.html'
      }
    };

    function convert (value, currency_id, date) {
      return value / exchange.rate(value, currency_id, date);
    }

    function doConvert (value, currency_id, date) {
      return exchange(value, currency_id, date);
    }

    function expose (data) {
      $scope.template = templates[origin];
      $scope.timestamp = new Date();
      data.origin = origin;
      data.invoiceId = invoiceId;
      data.convert = convert;
      data.doConvert = doConvert;
      commonData.resolve(data);
    }

    appstate.register('project', function (project) {
      dependencies.enterprise.query.where = ['project.id=' + project.id];
      dependencies.location.query = '/location/village/' + project.location_id;
      validate.process(dependencies)
      .then(expose);
    });
  }
]);
