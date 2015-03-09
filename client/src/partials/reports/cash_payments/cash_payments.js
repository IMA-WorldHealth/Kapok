angular.module('bhima.controllers')
.controller('reportCashPayments', [
  '$scope',
  '$timeout',
  '$translate',
  'connect',
  'appstate',
  'validate',
  'exchange',
  function ($scope, $timeout, $translate, connect, appstate, validate, exchange) {
    var session = $scope.session = {},
      state = $scope.state,
      allProjectIds = $scope.allProjectIds = '';

    $scope.selected = null;

    var dependencies = {};
    dependencies.projects = {
      required: true,
      query : {
        tables : {
          'project' : {
            columns : ['id', 'abbr', 'name']
          }
        }
      }
    };

    function day () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
    }

    function week () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      session.dateFrom.setDate(session.dateTo.getDate() - session.dateTo.getDay());
    }

    function month () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      session.dateFrom.setDate(1);
    }


    dependencies.currencies = {
      required : true,
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    dependencies.creditNote = {
      query : {
        tables : {
          'credit_note' : {
            columns : ['uuid', 'sale_uuid', 'cost']
          }
        }
      }
    };


    $scope.options = [
      {
        label : 'CASH_PAYMENTS.DAY',
        fn : day,
      },
      {
        label : 'CASH_PAYMENTS.WEEK',
        fn : week,
      },
      {
        label : 'CASH_PAYMENTS.MONTH',
        fn : month
      }
    ];

    function search (selection) {
      session.selected = selection.label;
      selection.fn();
    }

    function reset (p) {
      session.searching = true;
      var req, url,
        projectSelected = $scope.projectSelected,
        selected = $scope.selected = (session.project === $scope.allProjectIds)?$translate.instant('CASH_PAYMENTS.ALL_PROJECTS'):'selected';

      if(selected === 'selected'){
        dependencies.project = {
          required: true,
          query : {
            tables : {
              'project' : {
                columns : ['id', 'abbr', 'name']
              }
            },
            where : ['project.id=' + session.project]
          }
        };  
        validate.process(dependencies, ['project'])
        .then(function (model) {
          var dataproject = model.project.data[0];
          $scope.projectSelected = dataproject.name;
        });      
      } else {
        $scope.projectSelected = selected;
      }

      $scope.state = 'generate';
      // toggle off active
      session.active = !p;

      req = {
        dateFrom : session.dateFrom,
        dateTo : session.dateTo
      };

      url = '/reports/payments/?id=%project%&start=%start%&end=%end%'
      .replace('%project%', session.project)
      .replace('%start%', req.dateFrom)
      .replace('%end%', req.dateTo);

      connect.fetch(url)
      .then(function (model) {
        if (!model) { return; }
        $scope.payments = model;
        $scope.payments.forEach(function (item) {
          item.state = 0;
          $scope.creditNote.data.forEach(function (item2) {
            if(item.invoice_uuid === item2.sale_uuid){
              item.state = 1;
            }
          });     
        });  

        $timeout(function () {
          convert();
          session.searching = false;
        });
      });

    }

    appstate.register('project', function (project) {
      session.project = project.id;
      validate.process(dependencies)
      .then(function (models) {
        $scope.projects = models.projects;
        $scope.creditNote = models.creditNote;
        $scope.currencies = models.currencies;
        session.currency = $scope.currencies.data[0].id;
        $scope.allProjectIds =
          models.projects.data.reduce(function (a,b) { return a + ',' + b.id ; }, '')
          .substr(1); 
        search($scope.options[0]);
      });
    });

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise; 
    });    

    function convert () {
      var s = 0,
      sum_convert = 0,
      srest = 0,
      srest_convert = 0,
      sremis = 0,
      sremis_convert;

      $scope.payments.forEach(function (payment) {
        console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');
        console.log(payment.state);
        console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');
        if($scope.enterprise.currency_id !== payment.currency_id){
          var convert = payment.cost / exchange.rate(payment.cost, payment.currency_id,new Date());  
          s += convert;
          if(payment.state){
            sremis += convert;
          } else {
            srest += convert;
          }
        } else {
          s += payment.cost; 
          if(payment.state){
            sremis += payment.cost;
          } else {
            srest += payment.cost;
          }          
        }

        if ($scope.enterprise.currency_id === session.currency) {
          sum_convert = s; 
          sremis_convert = sremis;
          srest_convert = srest;
        } else {
          sum_convert = s * exchange.rate(payment.cost,session.currency,new Date());
          sremis_convert = sremis * exchange.rate(payment.cost,session.currency,new Date());
          srest_convert = srest * exchange.rate(payment.cost,session.currency,new Date());
        }
      });
      session.sum = sum_convert;
      session.remise = sremis_convert;
      session.rest = srest_convert;
    }

    $scope.$watch('payments', function () {
      if (!$scope.payments) { return; }
      var unique = [];
      $scope.payments.forEach(function (payment) {
        if (unique.indexOf(payment.deb_cred_uuid) < 0) {
          unique.push(payment.deb_cred_uuid);
        }
      });

      session.unique_debitors = unique.length;
    }, true);

    $scope.print = function print() {
      window.print();
    };

   function reconfigure () {
      $scope.state = null;
    }

    $scope.search = search;
    $scope.reset = reset;
    $scope.convert = convert;
    $scope.reconfigure = reconfigure;
  }
]);
