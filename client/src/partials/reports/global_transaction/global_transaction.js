angular.module('bhima.controllers')
.controller('report.global_transaction', [
  '$scope',
  'connect',
  'appstate',
  '$translate',
  'validate',
  'util',
  function ($scope, connect, appstate, $translate, validate, util) {

    var dependencies = {}, map = {};
    $scope.model = {};
    $scope.model.sources = [$translate.instant('SELECT.ALL'), $translate.instant('SELECT.POSTING_JOURNAL'), $translate.instant('SELECT.GENERAL_LEDGER')];
    $scope.somDebit = 0;
    $scope.somCredit = 0;

    dependencies.accounts = {
      required : true,
      query : {
        tables : {'account' : {columns : ['id', 'account_number', 'account_txt', 'account_type_id']}}
      }
    };

    dependencies.exchange_rate = {
      query : {
        tables : {
          'exchange_rate' : {
            columns : ['id', 'foreign_currency_id', 'rate', 'date']
          }
        }
      }
    };

    dependencies.currencies = {
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    $scope.dates = {};
    $scope.state = {};
    $scope.account = {};

    function formatAccount(account) {
      return [
        account.account_number, account.account_txt
      ].join(' -- ');
    }

    function init(model) {
      angular.extend($scope, model);
      $scope.accounts.data.forEach(function (account) {
        account.account_number = String(account.account_number);
      });
      $scope.model.c = $scope.enterprise.currency_id;
      $scope.exchange_rate.data.forEach(function (item) {
        map[util.sqlDate(item.date)] = {c_id : item.foreign_currency_id, rate : item.rate};
      });
    }

    function fill() {
      if (!$scope.enterprise || !$scope.exchange_rate) {return;}
      var f = ($scope.model.account_id && $scope.model.account_id !== 0) ? selective($scope.model.account_id) : all();
    }

    function selective() {
      $scope.mode = 'selected';
      var qo = {
        source : $scope.model.source_id,
        enterprise_id : $scope.enterprise.id,
        account_id : $scope.model.account_id,
        datef : util.sqlDate($scope.dates.from),
        datet : util.sqlDate($scope.dates.to)
      };

      $scope.model.account_number = $scope.accounts.get($scope.model.account_id).account_number;
      connect.fetch('/reports/allTrans/?'+JSON.stringify(qo))
      .then(function (res) {
        if (res.length > 0) {
          if (res.length > 0) {
            res.map(function (item) {
              item.debit = getValue(map[util.sqlDate(item.trans_date)], item.debit, $scope.enterprise.currency_id);
              item.credit = getValue(map[util.sqlDate(item.trans_date)], item.credit, $scope.enterprise.currency_id);
            });
            $scope.records = res;
            getTotal(res);
          } else {
            getTotal(res);
            $scope.records = [];
          }
        }
      });
    }

    function all() {
      $scope.mode = 'all';
      var qo = {
        source : $scope.model.source_id,
        enterprise_id : $scope.enterprise.id,
        account_id : 0,
        datef : util.sqlDate($scope.state.from),
        datet : util.sqlDate($scope.state.to)
      };
      connect.fetch(
        '/reports/allTrans/?'+JSON.stringify(qo)
      ).then(function (res) {
          if (res.length > 0) {
            res.map(function (item) {
              item.debit = getValue(map[util.sqlDate(item.trans_date)], item.debit, $scope.enterprise.currency_id);
              item.credit = getValue(map[util.sqlDate(item.trans_date)], item.credit, $scope.enterprise.currency_id);
            });
            $scope.records = res;
            getTotal(res);
          }else{
            $scope.records = [];
            getTotal(res);
          }
        });
    }

    function dateWatcher () {
      $scope.state.from = util.sqlDate($scope.dates.from);
      $scope.state.to = util.sqlDate($scope.dates.to);
    }

    function getValue (obj, val, cVal) {
      if (cVal === $scope.model.c) { return val; }
      return (obj.c_id === cVal)? 1 : (obj.rate) * val; //not good because it supporte only two currency, I will fix it very soon
    }

    function search () {
      if (!$scope.model.account_id) { return; }
      $scope.mode = $scope.model.account_id !== 0 ? 'selected' : 'all';
      var qo = {
        source : $scope.model.source_id,
        enterprise_id : $scope.enterprise.id,
        account_id : $scope.model.account_id,
        datef : util.sqlDate($scope.state.from),
        datet : util.sqlDate($scope.state.to)
      };

      if ($scope.model.account_id && $scope.model.account_id === 0) {
        $scope.model.account_number = 'Tous';
      } else {
        $scope.model.account_number = $scope.accounts.get($scope.model.account_id).account_number;
      }

      connect.fetch('/reports/allTrans/?'+JSON.stringify(qo))
      .then(function (res) {
        if (res.length > 0) {
          res.map(function (item) {
            item.debit = getValue(map[util.sqlDate(item.trans_date)], item.debit, $scope.enterprise.currency_id);
            item.credit = getValue(map[util.sqlDate(item.trans_date)], item.credit, $scope.enterprise.currency_id);
          });
          $scope.records = res;
          getTotal(res);
        } else {
          getTotal(res);
          $scope.records = [];
        }
      });
    }

    function getTotal(items) {
      $scope.somCredit = 0;
      $scope.somDebit = 0;
      if (items.length > 0) {
        items.forEach(function (item) {
          $scope.somDebit+=item.debit;
          $scope.somCredit+=item.credit;
        });
      }
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      $scope.dates.from = new Date();
      $scope.dates.to = new Date();
      dependencies.accounts.query.where = ['account.enterprise_id='+enterprise.id];
      validate.process(dependencies)
      .then(init);
    });

    $scope.$watch('dates', dateWatcher, true);
    $scope.$watch('model.account_id', fill);
    $scope.$watch('model.c', fill);

    $scope.formatAccount = formatAccount;
    $scope.search = search;
  }
]);
