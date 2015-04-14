angular.module('bhima.controllers')
.controller('manageAccount', [
  '$scope',
  'validate',
  'appstate',
  'connect',
  '$translate',
  'liberror',
  function ($scope, validate, appstate, connect, $translate, liberror) {
    /* jshint unused : false */
    var dependencies = {}, titleAccount = 3;
    var grid, columns, options, dataview, sortColumn = 'account_number';
    // var financeGroups = {index: {}, store: []};
    var session = $scope.session = { state: 'display' };

    var accountError = liberror.namespace('ACCOUNT');

    $scope.newAccount = {};

    dependencies.account = {
      required : true,
      query : {
        identifier : 'account_number',
        tables : {
          account : { columns : ['id', 'account_number', 'account_txt', 'account_type_id', 'is_asset', 'parent'] },
	  account_type : { columns : ['type::account_type'] }
        },
	join: [ 'account.account_type_id=account_type.id' ]
      }
    };

    dependencies.accountType = {
      query : {
        tables : {
          account_type : { columns : ['id', 'type'] }
        }
      }
    };

    function manageAccount(model) {
      $scope.model = model;

      appstate.register('enterprise', loadEnterprise);
      defineGridOptions();
      initialiseGrid();
    }

    validate.process(dependencies).then(manageAccount);

    function loadEnterprise(enterprise) { $scope.enterprise = enterprise; }

    function defineGridOptions() {

      columns = [
        {id: 'ACCOUNT.LABEL', name: 'Label', field: 'account_txt', formatter: AccountFormatter},
        {id: 'ACCOUNT.NO', name: 'No.', field: 'account_number'},
        {id: 'ACCOUNT.TYPE', name: 'Type', field: 'account_type', maxWidth: 90},
        {id: 'ACCOUNT.IS_ASSET_TITLE', name: 'IsAsset', field: 'is_asset', maxWidth: 90}
      ];

      columns.forEach(function (col) {
        col.name = $translate.instant(col.id);
      });

      options = {
        enableCellNavigation: true,
        enableColumnReorder: true,
        forceFitColumns: true,
        rowHeight: 30
      };

      awfulIndentCrawl($scope.model.account.data);
    }

    function initialiseGrid() {
      var groupItemMetadataProvider;

      groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
      dataview = new Slick.Data.DataView({
        groupItemMetadataProvider: groupItemMetadataProvider,
        inlineFilter: true
      });

      grid = new Slick.Grid('#account_grid', dataview, columns, options);
      grid.registerPlugin(groupItemMetadataProvider);

      grid.onSort.subscribe(function(e, args) {
        sortColumn = args.sortCol.field;
        // FIXME : compareSort is unimplemented
        //dataview.sort(compareSort, args.sortAsc);
      });

      //FIXME improve this function (redundant code) extract from main initialise)
      grid.onClick.subscribe(function(e, args) {
        if ($(e.target).hasClass('toggle')) {
          var item = dataview.getItem(args.row);
          if (item) {
            if (!item._collapsed) {
              item._collapsed = true;
            } else {
              item._collapsed = false;
            }
            dataview.updateItem(item.id, item);
          }
          e.stopImmediatePropagation();
        }

        // FIXME: This could be formalized/encapsulated
        if ($(e.target).hasClass('remove')) {
          $scope.$apply(function () {
            accountError.throw('ERR_CANNOT_REMOVE_ACCOUNT');
          });
        }

        if ($(e.target).hasClass('edit')) {
          $scope.$apply(function () {
            accountError.throw('ERR_CANNOT_EDIT_ACCOUNT');
          });
        }
      });

      dataview.onRowCountChanged.subscribe(function(e, args) {
        awfulIndentCrawl($scope.model.account.data);
        sortAccounts();
        grid.updateRowCount();
        grid.render();
      });

      dataview.onRowsChanged.subscribe(function(e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
      });

      dataview.beginUpdate();
      dataview.setItems($scope.model.account.data);
      sortAccounts();
      dataview.setFilter(accountFilter);
      dataview.endUpdate();
    }

    function sortAccounts() {
      dataview.sort(ohadaSort, true);
      $scope.model.account.recalculateIndex();
    }

    function ohadaSort(a, b) {
      var x = String(a[sortColumn]), y = String(b[sortColumn]);
      return (x === y) ? 0 : (x > y ? 1 : -1);
    }

    function accountFilter(item) {
      if (item.parent !== null) {
        var parent = $scope.model.account.get(item.parent);
        while (parent) {
          if (parent._collapsed) { return false; }
          parent = $scope.model.account.get(parent.parent);
        }
      }
      return true;
    }

    //runs in O(O(O(...)))
    function awfulIndentCrawl(data) {
      data.forEach(function (item) {
        var indent = 0;
        var parent = $scope.model.account.get(item.parent);
        while (parent) {
          indent += 1;
          parent = $scope.model.account.get(parent.parent);
        }
        item.indent = indent;
      });
    }

    function submitAccount(account) {
      //do some kind of validation
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
        enterprise_id: appstate.get('enterprise').id,
        parent: 0, //set default parent (root)
        classe: account.number.substr(0,1)
      };

      if (account.parent) {
        formatAccount.parent = account.parent.account_number;
      }

      connect.basicPut('account', [formatAccount])
      .then(function(res) {
        formatAccount.id = res.data.insertId;
        $scope.model.account.post(formatAccount);
        dataview.refresh();

        //reset form
        $scope.newAccount.title = '';
        $scope.newAccount.number = '';

        if(formatAccount.account_type_id === titleAccount) {
          //console.log('update parent');
          $scope.newAccount.parent = $scope.model.account.get(formatAccount.account_number);
          //console.log($scope.newAccount.parent);
        }

      });
    }

    function updateState(newState) { session.state = newState; }

    function AccountFormatter(row, cell, value, columnDef, dataContext) {
      var spacer = '<span style="display:inline-block;height:1px;width:' + (15 * dataContext.indent) + 'px"></span>';

      if(dataContext.account_type_id === titleAccount) {
        if (dataContext._collapsed) {
          return spacer + ' <span class=\'toggle expanded glyphicon glyphicon-collapse-up\'></span>&nbsp; <b>' + value + '</b>';
        } else {
          return spacer + ' <span class=\'toggle collapsed glyphicon glyphicon-collapse-down\'></span>&nbsp; <b>' + value + '</b>';
        }
      } else {
        return spacer + ' <span class=\'toggle\'></span>&nbsp;' + value;
      }
    }

    function EditFormatter() {
      return '<a class=\'grid_link edit\'><span class=\'glyphicon glyphicon-pencil edit\'></span></a>';
    }

    function DeleteFormatter() {
      return '<a class=\'grid_link remove\'><span class=\'glyphicon glyphicon-trash remove\'></span></a>';
    }

    $scope.updateState = updateState;
    $scope.submitAccount = submitAccount;
  }
]);
