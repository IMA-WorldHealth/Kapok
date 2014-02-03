angular.module('kpk.controllers').controller('manageAccount', function($scope, $q, validate, appstate, messenger, connect) { 
  var dependencies = {}, titleAccount = 3, formState = $scope.formState = "display";  
  var grid, columns, options, dataview, sortColumn = "account_number";
  var financeGroups = {index: {}, store: []};

  $scope.newAccount = {}; 

  dependencies.account = { 
    required : true,
    query : {
      identifier : 'account_number',
      tables : {
        account : { columns : ["id", "account_number", "account_txt", "account_type_id", "fixed", "parent"] }
      }
    },
  };
  
  dependencies.accountType = { 
    query : {
      tables : { 
        account_type : { columns : ["id", "type"] }
      }
    }
  };

  validate.process(dependencies).then(manageAccount);

  function manageAccount(model) {
    $scope.model = model;
    
    appstate.register('enterprise', loadEnterprise);
    defineGridOptions();
    initialiseGrid();
  } 

  function loadEnterprise(enterprise) { $scope.enterprise = enterprise; }

  function defineGridOptions() { 
    columns = [
      {id: 'account_txt', name: 'Text', field: 'account_txt', formatter: AccountFormatter},
      {id: 'account_number', name: 'No.', field: 'account_number'},
      {id: 'account_type_id', name: 'Type', field: 'account_type_id', maxWidth: 60},
      {id: 'fixed', name: 'Fixed', field: 'fixed', maxWidth: 60}
    ];
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
      dataview.sort(compareSort, args.sortAsc);
    })
    
    //FIXME improve this function (redundant code) extract from main initialise)
    grid.onClick.subscribe(function(e, args) { 
      if ($(e.target).hasClass("toggle")) {
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
    return (x == y) ? 0 : (x > y ? 1 : -1);
  }

  function accountFilter(item) {
    if (item.parent != null) {
      var parent = $scope.model.account.get(item.parent);
      while (parent) {
        if (parent._collapsed) return false;
        parent = $scope.model.account.get(parent.parent);
      }
    }
    return true;
  }

  //runs in O(O(O(...)))
  function awfulIndentCrawl(data) { 
    data.forEach(function(item, index) { 
      var indent = 0;
      var parent = $scope.model.account.get(item.parent);
      while(parent) { 
        indent++;
        parent = $scope.model.account.get(parent.parent);
      }
      item.indent = indent;
    });
  }
  
  function submitAccount(account) {
    //do some kind of validation
    //kill if account exists for now 
    if($scope.model.account.get(account.number)) return messenger.push({type: 'danger', msg: 'Account number already exists'});

    //format account
    var formatAccount = { 
      account_type_id: account.type.id,
      account_number: account.number,
      account_txt: account.title,
      fixed: account.fixed === "true" ? 1 : 0,
      enterprise_id: appstate.get('enterprise').id,
      parent: 0 //set default parent (root)
    }
    
    if(account.parent) formatAccount.parent = account.parent.account_number;

    connect.basicPut("account", [formatAccount]).then(function(res) { 
      formatAccount.id = res.data.insertId;
      $scope.model['account'].post(formatAccount);
      dataview.refresh();

      //reset form
      $scope.newAccount.title = "";
      $scope.newAccount.number = "";
      
      if(formatAccount.account_type_id === titleAccount) { 
        console.log('update parent');
        $scope.newAccount.parent = $scope.model['account'].get(formatAccount.account_number);
        console.log($scope.newAccount.parent);
      }

    }, function(err) { 
      messenger.push({type: 'danger', msg: 'Could not insert account: ' + err}); 
    });
  }
  
  function updateState(newState) { $scope.formState = newState; }

  function AccountFormatter(row, cell, value, columnDef, dataContext) {
    var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
   
    if(dataContext.account_type_id === titleAccount) { 
      if (dataContext._collapsed) {
        return spacer + " <span class='toggle expanded glyphicon glyphicon-collapse-up'></span>&nbsp; <b>" + value + "</b>";
      } else {
        return spacer + " <span class='toggle collapsed glyphicon glyphicon-collapse-down'></span>&nbsp; <b>" + value + "</b>";
      }
    } else {
      return spacer + " <span class='toggle'></span>&nbsp;" + value;
    }
  };
  
  $scope.updateState = updateState;
  $scope.submitAccount = submitAccount;
});
