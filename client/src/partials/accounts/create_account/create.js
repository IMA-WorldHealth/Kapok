angular.module('bhima.controllers')
.controller('manageAccount', [
  '$scope',
  'validate',
  'appstate',
  'connect',
  '$translate',
  'liberror',
  'messenger',
  function ($scope, validate, appstate, connect, $translate, liberror, messenger) {
    /* jshint unused : false */
    var dependencies = {}, titleAccount = 3;
    var grid, columns, options, dataview, sortColumn = 'account_number';
    var session = $scope.session = { state: 'display' };

    var accountError = liberror.namespace('ACCOUNT');

    $scope.newAccount = {};
    $scope.editAccount = {};

    dependencies.account = {
      required : true,
      query : {
        identifier : 'account_number',
        tables : {
          account : { columns : ['id', 'account_number', 'account_txt', 'account_type_id', 'cc_id', 'pc_id', 'is_asset', 'is_ohada', 'parent', 'locked'] },
	        account_type : { columns : ['type::account_type'] }
        },
        join: [ 'account.account_type_id=account_type.id' ]
      }
    };

    dependencies.costCenter = {
      query : {
        tables : { 
          cost_center : { columns : ['id', 'text'] },
          project     : { columns : ['abbr']}
        },
        join : ['cost_center.project_id=project.id']
      }
    };

    dependencies.profitCenter = {
      query : {
        tables : { 
          profit_center : { columns : ['id', 'text'] },
          project       : { columns : ['abbr']}
        },
        join : ['profit_center.project_id=project.id']
      }
    };

    dependencies.accountType = {
      query : {
        tables : {
          account_type : { columns : ['id', 'type'] }
        }
      }
    };

    appstate.register('enterprise', loadEnterprise);

    function loadEnterprise(enterprise) { 
      $scope.enterprise = enterprise; 
      validate.process(dependencies).then(manageAccount);
    }

    function manageAccount(model) {
      $scope.model = model;
      sortAccountList(model.account.data);
    }

    function submitAccount(account) {
      //kill if account exists for now
      if ($scope.model.account.get(account.number)) {
        return accountError.throw('ERR_ACCOUNT_EXISTS', account.number);
      }

      //format account
      var classe = account.number.substr(0,1);
      if(account.is_asset === 'true'){
        account.is_asset = 1;
      } else if (account.is_asset === 'false'){
        account.is_asset = 0;
      } else {
        account.is_asset = null;
      }

      var formatAccount = {
        account_type_id: account.type.id,
        account_number: account.number,
        account_txt: account.title,
        is_asset: account.is_asset,
        is_ohada: account.is_ohada,
        cc_id   : account.cc_id,
        pc_id   : account.pc_id,
        enterprise_id: appstate.get('enterprise').id,
        parent: 0, //set default parent (root)
        classe: account.number.substr(0,1)
      };

      if (account.parent) {
        formatAccount.parent = account.parent.account_number;
      }

      connect.post('account', [formatAccount])
      .then(refreshAccountList)
      .then(function () {
        messenger.success($translate.instant('CONFIG_ACCOUNTING.SAVE_SUCCES'), true);
        $scope.newAccount = {};
        session.state = 'display';
      });
    }

    function updateState(newState) { 
      session.state = newState; 
    }

    function formatCenter (c) {
      return '' + c.text;
    }

    function getAccountClass () {
      session.accountClass = $scope.checkClass($scope.newAccount.number);
    }

    $scope.checkClass = function (account_number) {
      return String(account_number).charAt(0);
    };

    $scope.discareCC = function () {
      $scope.newAccount.cc_id = null;
    };

    $scope.discarePC = function () {
      $scope.newAccount.pc_id = null;
    };

    $scope.getAccount = function (account) {
      session.state = 'edit';
      $scope.editAccount = account;
    };

    function submitEditAccount (account) {
      /**
        * Only account of 'income/expense' type have cc_id or pc_id
        * Only account of 'title' type have is_asset 
      */

      if($scope.editAccount.is_asset === 'true' || $scope.editAccount.is_asset === 1){
        $scope.editAccount.is_asset = 1;
      } else if ($scope.editAccount.is_asset === 'false' || $scope.editAccount.is_asset === 0){
        $scope.editAccount.is_asset = 0;
      } else {
        $scope.editAccount.is_asset = null;
      }

      var update = {
        id          : account.id,
        account_txt : $scope.editAccount.account_txt,
        is_asset    : $scope.editAccount.is_asset,
        is_ohada    : $scope.editAccount.is_ohada,
        locked      : $scope.editAccount.locked,
        cc_id       : $scope.editAccount.cc_id,
        pc_id       : $scope.editAccount.pc_id
      };

      connect.put('account', [update], ['id'])
      .then(refreshAccountList)
      .then(function () {
        messenger.success($translate.instant('CONFIG_ACCOUNTING.UPDATE_SUCCES'), true);
        $scope.editAccount = {};
        session.state = 'display';
      });
    }

    function refreshAccountList () {
      validate.refresh(dependencies, ['account'])
      .then(manageAccount);
    }

    function sortAccountList (data) {
      data.sort(function (a, b) {
        return String(a.account_number) >= String(b.account_number) ? 1 : -1;
      });
    }

    $scope.updateState = updateState;
    $scope.submitAccount = submitAccount;
    $scope.formatCenter = formatCenter;
    $scope.getAccountClass = getAccountClass;
    $scope.submitEditAccount = submitEditAccount;
  }
]);
