angular.module('bhima.controllers')
.controller('accountsReport', [
  '$scope',
  'appstate',
  'validate',
  function($scope, appstate, validate) {
    var dependencies = {};

    dependencies.account = {
      required: true,
      query: {
        tables: {
          'account': {
            columns: ['id', 'account_txt', 'account_number', 'parent', 'account_type_id']
          }
        }
      }
    };

    function accountsReport(model) {
      appstate.register('enterprise', function(res) {
        $scope.enterprise = res;
        $scope.timestamp = new Date();
      });

      $scope.model = model;
      sortAccounts($scope.model.account);
      parseAccountDepth($scope.model.account.data, $scope.model.account);
    }

    function sortAccounts(accountModel) {
      var data = accountModel.data;

      data.sort(function (a, b) {
        var left = String(a.account_number), right = String(b.account_number);
        return (left === right) ? 0 : (left > right ? 1 : -1);
      });
      accountModel.recalculateIndex();
    }

    function parseAccountDepth(accountData, accountModel) {
      accountData.forEach(function (account) {
        var parent, depth = 0;

        //TODO if parent.depth exists, increment and kill the loop (base case is ROOT_NODE)
        parent = accountModel.get(account.parent);
        depth = 0;
        while(parent) {
          depth += 1;
          parent = accountModel.get(parent.parent);
        }
        account.depth = depth;
      });
    }

    validate.process(dependencies).then(accountsReport);
    $scope.printReport = function() { print(); };
  }
]);
