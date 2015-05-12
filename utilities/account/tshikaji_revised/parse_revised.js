var fs = require('fs'), q = require('q');

var accountFilePath = "./PLAN COMPTABLE REVISE.csv";
var maxAccountDetails = 2, schema = [], schemaIndex;

// Account detail indexs (from CSV)
var accountLabel = 2, accountNumber = 1

var accountNumberLength = 7;
var sqlOutput = [], csvOutput = [];

readFile(accountFilePath).then(parseCSV);

function parseCSV(fileData) {
  var groups = {}, rawSchema = fileData.split(','), index = 0;
  var currentParent = 0, previousParent = currentParent;

  var parentRel = {};

  try {
  // Store CSV data as account schema
  do {
    var enterpriseId, accountInstance, indexContext = index * maxAccountDetails;
    var buildUniqueAccount = [];


    accountInstance = {
      label   : rawSchema[indexContext + accountLabel],
      number  : rawSchema[indexContext + accountNumber],
      parent  : 0
    };


    if(accountInstance.number !== '' && accountInstance.number !== undefined) {
      accountInstance.label = accountInstance.label.trim();
      // FIXME done very quickly, deriving relationships can be cleaner than this
      for(parentAccount in parentRel) {
        if(accountInstance.number.slice(0, parentAccount.length) === parentAccount) accountInstance.parent = parentAccount;
      }

      if(accountInstance.number.length < accountNumberLength) {

        //title account
        // accountInstance.parent = currentParent;
        accountInstance.account_type_id = 3;
        parentRel[accountInstance.number] = accountInstance.number;
        // currentParent = accountInstance.number;
      } else {
        if(accountInstance.number[0] == '6' || accountInstance.number === '7') {
          accountInstance.account_type_id = 1;
        } else {
          accountInstance.account_type_id = 2;
        }
      }

      schema.push(accountInstance);
    }
    index++;
  } while (accountInstance.number || accountInstance.number==='');

  } catch (e) {
    console.log(e);
  }
  //
  // initGroups(groups, schema);
  // parseRelation(groups, 2);
  //
  // // Second pass removes nested titles, could probably be smarter about this
  // removeRedundant(groups);
  // removeRedundant(groups);
  //
  // sqlPrint(groups, 0);
  // csvPrint(groups, 0, 0);
  //

  // Very temporary output
  console.log("insert into `account` (`fixed`, `locked`, `enterprise_id`, `account_number`, `account_txt`, `account_type_id`, `parent`) values");
  schema.forEach(function (account, index) {
    console.log('(0, 0, 200,' + account.number + ',"' + account.label + '",' + account.account_type_id + ',' + account.parent + '),');
  });
}

function initGroups(store, data) {
  var accountIndex = JSON.parse(JSON.stringify(Object.keys(data)));
  var identify, accountGroupIndex = 1;

  accountIndex.forEach(function (accountNumber) {
    var account = data[accountNumber];
    var identify = accountNumber.slice(0, accountGroupIndex);

    if(store[identify]) {
      store[identify][accountNumber] = accountNumber;
    } else {
      store[identify] = {}

      store[identify][accountNumber] = accountNumber;
    }
  });
}

function parseRelation(group, indexLevel) {

  for(accountIndex in group) {
    var accountGroup = group[accountIndex];

    // crazy hacks
    if(accountIndex.length < accountNumberLength -1) {

      for(account in accountGroup) {
        var identify = account.slice(0, indexLevel);

        if(accountGroup[identify]) {
          accountGroup[identify][account] = account;
        } else {
          accountGroup[identify] = {};
          accountGroup[identify][account] = account;
        }

        delete accountGroup[account];
      }

      parseRelation(accountGroup, indexLevel+1);
    }
  }
}

function groupDebugPrint(group, indentLevel) {
  for(account in group) {
    var spacer = new Array(indentLevel);
    console.log(spacer, account);

    if(account.length < accountNumberLength) {
      groupDebugPrint(group[account], indentLevel + 1);
    }
  }
}

function csvPrint(group, parentAccountNumber, indentLevel) {
  for(account in group) {

    var indentString = '';
    for(var i=0; i < indentLevel; i++) { indentString+='.'; }

    if(account.length < accountNumberLength) {
      var accountNumber = account;

      csvOutput.push(accountNumber + ',' + indentString + 'Title Account for ' + account + ',' + parentAccountNumber);
      csvPrint(group[account], accountNumber, indentLevel + 1);
    } else {
      var accountType = (account[0] === '6' || account[0] === '7') ? '1' : '2';
      csvOutput.push(account + ',' + indentString + schema[account].label + ',' + parentAccountNumber);
    }
  }

}

function sqlPrint(group, parentAccountNumber) {
  for(account in group) {

    if(account.length < accountNumberLength) {
      var accountNumber = account;
      sqlOutput.push('(0, 0, 200,' + accountNumber + ',"Title Account for ' + account + '", 3,' + parentAccountNumber + ')');
      sqlPrint(group[account], accountNumber);
    } else {
      var accountType = (account[0] === '6' || account[0] === '7') ? '1' : '2';
      sqlOutput.push('(0, 0, 200,' + account + ',"' + schema[account].label + '",' + accountType + ',' + parentAccountNumber + ')');
    }
  }
}

function padNumber(accountNumber) {
  var difference = accountNumberLength - accountNumber.length;
  for(var i = 0; i <= difference; i++) {
    accountNumber += '0';
  }
  return accountNumber;
}

function removeRedundant(group) {
  for (accountIndex in group) {
    var keys, accountGroup = group[accountIndex], iterate;

    if (typeof(accountGroup) === 'object') {

      keys = Object.keys(accountGroup);
      iterate = true;

      if(keys.length === 1) {

        while(keys.length === 1 && iterate) {
          // console.log('cleaned up', keys[0]);
          group[keys[0]] = accountGroup[keys[0]];
          // console.log('deleting', accountIndex);
          delete group[accountIndex];

          accountGroup = group[keys[0]];
          accountIndex = keys[0];

          if(typeof(accountGroup) !== 'object') {
            iterate = false;
          } else {
            keys = Object.keys(accountGroup);
          }
        }
      } else {
        removeRedundant(accountGroup, 1);
      }
    }
  }
}

function readFile(filePath) {
  var deferred = q.defer();

  fs.readFile(filePath, 'utf8', function(readError, readResult) {
    if(readError) throw readError;
    deferred.resolve(readResult);
  });
  return deferred.promise;
}
