angular.module('bhima.controllers')
.controller('primary_cash.cotisation_payment', [
  '$scope',
  '$routeParams',
  '$translate',
  '$http',
  'messenger',
  'validate',
  'appstate',
  'appcache',
  'connect',
  'util',
  'exchange',
  '$q',
  'uuid',
  function ($scope, $routeParams, $translate, $http, messenger, validate, appstate, Appcache, connect, util, exchange, $q, uuid) {
    var dependencies = {},
        cache = new Appcache('cotisation_payment'),
        session = $scope.session = {
          configured : false, 
          complete : false, 
          data : {},
          rows : []
        };

    session.cashbox = $routeParams.cashbox;

    dependencies.cashier = {
      query : 'user_session'
    };

    dependencies.cash_box = {
      required : true,
      query : {
        tables : {
          'cash_box_account_currency' : {
            columns : ['id', 'currency_id', 'account_id']
          },
          'currency' : {
            columns : ['symbol', 'min_monentary_unit']
          },
          'cash_box' : {
            columns : ['id', 'text', 'project_id']
          }
        },
        join : [
          'cash_box_account_currency.currency_id=currency.id',
          'cash_box_account_currency.cash_box_id=cash_box.id'
        ],
        where : [
          'cash_box_account_currency.cash_box_id=' + session.cashbox
        ]
      }
    };

    dependencies.paiement_period = {
      query : {
        tables : {
          'paiement_period' : {
            columns : ['id', 'config_tax_id', 'config_rubric_id', 'label', 'dateFrom', 'dateTo']
          }
        }
      }
    };

    appstate.register('project', function (project) {
      $scope.project = project;               
        validate.process(dependencies, ['paiement_period', 'cashier', 'cash_box'])
        .then(init, function (err) {
          messenger.danger(err.message + ' ' + err.reference);
        });     
    });

    function init (model) {
      session.model = model;
      cache.fetch('paiement_period')
      .then(function (pp) {
        if(!pp){
          // throw new Error('period paiement not defined');
          // A FIXE : ASTUCE POUR NE PAS AFFICHER LE MESSAGE D'ERREUR ET NE RIEN AFFICHER         
          session.pp = {};
          session.pp.id = -1;        
        }else{
          session.pp = pp; 
          session.pp_label = formatPeriod (pp);
        }
        
        dependencies.employees_payment = {
          query : '/getEmployeeCotisationPayment/' + session.pp.id
        };
        
        return validate.process(dependencies, ['employees_payment']);
      })
      .then(function (model) {
        session.model = model;
        session.configured = (session.pp.id > 0) ? true : false ;
        session.complete = true;
        session.available = (session.model.employees_payment.data.length > 0) ? true : false ;
      })
      .catch(function (err) {
        console.log('err', err);
        messenger.danger(err.message);
      });
    }

    function reconfigure() {
      cache.remove('paiement_period');
      session.pp = null;
      session.configured = false;
      session.complete = false;
      session.available = false;
      session.pp_label = '';
    }

    function formatPeriod (pp) {
      return [pp.label, util.sqlDate(pp.dateFrom), util.sqlDate(pp.dateTo)].join(' / ');
    }

    function setConfiguration (pp) {
      if(pp){
        cache.put('paiement_period', pp)
        .then(function () {
          session.pp = pp;
          session.configured = true;
          session.complete = true;
          session.available = true;
          init(session.model);
        });
      }           
    }

    function getCashAccountID (currency_id) {
      return session.model.cash_box.data.filter(function (item) {
        return item.currency_id === currency_id;
      })[0].account_id;
    }

    function submit (emp) {
      var document_uuid = uuid();

      var primary = {
        uuid          : uuid(),
        project_id    : $scope.project.id,
        type          : 'S',
        date          : util.sqlDate(new Date()),
        deb_cred_uuid : emp.creditor_uuid,
        deb_cred_type : 'C',
        account_id    : getCashAccountID(emp.currency_id),
        currency_id   : emp.currency_id,
        cost          : emp.value,
        user_id       : session.model.cashier.data.id,
        description   : 'Cotisation Payment ' + '(' + emp.label + ') : ' + emp.name + emp.postnom,
        cash_box_id   : session.cashbox,
        origin_id     : 8,
      };

      var primary_details = {
        uuid              : uuid(),
        primary_cash_uuid : primary.uuid,
        debit             : 0,
        credit            : primary.cost,
        inv_po_id         : emp.paiement_uuid,
        document_uuid     : document_uuid
      };

      var other = {
        cotisation_id : emp.cotisation_id
      };

      var package = {
        primary : primary,
        primary_details : primary_details,
        other : other
      };

      $http.post('payCotisation/', package)
      .then(function (res){
         // A FIXE : Using $http instead connect
        var formatObject = {
          table : 'cotisation_paiement',
          paiement_uuid : emp.paiement_uuid,
          cotisation_id : emp.cotisation_id
        };
        return $http.put('/setCotisationPayment/', formatObject)
        .success(function (res) {
          emp.posted = 1;
          console.log('Update Cotisation Payment success');
        });
      });
    }

    $scope.formatPeriod = formatPeriod;
    $scope.reconfigure = reconfigure;
    $scope.submit = submit;
    $scope.setConfiguration = setConfiguration;
  }
]);
