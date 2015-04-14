// reports_proposed/data/balance_sheet.js
// Collects and aggregates data for the enterprise balance sheet
var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');

// Constant: root account id
var ROOT_ACCOUNT_ID = 0;

var formatDollar = '$0,0.00';
var bilanDate = new Date();

// TODO Query for balance and title account IDs
var balanceAccountId = 2;
var titleAccountId = 3;

// This method builds a tree data structure of
// accounts and children of a specified parentId.
function getChildren(accounts, parentId, depth) {
  var children;

  // Base case: There are no child accounts
  // Return an empty array
  if (accounts.length === 0) { return []; }

  // Returns all accounts where the parent is the
  // parentId
  children = accounts.filter(function (account) {
    return account.parent === parentId;
  });

  // Recursively call get children on all child accounts
  // and attach them as childen of their parent account
  children.forEach(function (account) {
    account.depth = depth;
    account.children = getChildren(accounts, account.id, depth+1);
  });

  return children;
}


// FIXME Whatever - Jog on CS 101 - oh man
function filterEmptyAccounts(accounts) {
  var removedAccount = true;

  while (removedAccount) {
    removedAccount = false;
    accounts = accounts.filter(emptyFilter);
  }

  function emptyFilter(account) {
    var hasNoChildren = account.children.length === 0;

    if (account.account_type_id === titleAccountId && hasNoChildren) {
      removedAccount = true;
    } else {
      account.children = account.children.filter(emptyFilter);
      return account;
    }
  }

  return accounts;
}

// Adds the balance of a list of accounts to
// an aggregate value
function aggregate(value, account) {

  var isLeaf = account.children.length === 0;

  // FIXME MySQL querry should never return NULL - normalization should not have to be done
  account.balance = account.balance || 0;

  // FIXME Balances are ONLY ever assigned to the very top level accounts, not for every title account
  account.formattedBalance = numeral(account.balance).format(formatDollar);

  // if the account has children, recursively
  // recursively call aggregate on the array of accounts
  if (!isLeaf) {
    return value + account.children.reduce(aggregate, 0);
  }
  return value + account.balance;
}

function getBalance(account) {
  var som = 0;
  account.children.forEach(function (child) {
    som += child.balance + getBalance(child);
  });

  return som;
}

// expose the http route
exports.compile = function (options) {
  'use strict';

  var deferred = q.defer();
  var context = {};
  // var fiscalYearId = options.fiscalYearId;


  context.reportDate = bilanDate.toDateString();

  var sql =
    'SELECT account.id, account.account_number, account.account_txt, account.account_type_id, account.is_asset, account.parent, totals.balance, totals.period_id ' +
    'FROM account LEFT JOIN (' +
      'SELECT period_total.account_id, IFNULL(SUM(period_total.debit - period_total.credit), 0) as balance, period_total.period_id ' +
      'FROM period_total ' +
      'GROUP BY period_total.account_id ' +
    ') AS totals ON totals.account_id = account.id ' +
    'WHERE account.account_type_id IN (?, ?);';

  db.exec('SELECT id FROM account_type WHERE type="balance";')
  .then(function (rows) {

    // pull out the account type id for the balance accounts
    var balanceId = rows[0].id;

    return db.exec(sql, [balanceAccountId, titleAccountId]);
  })
  .then(function (accounts) {
    var accountTree;

    accountTree = getChildren(accounts, ROOT_ACCOUNT_ID, 0);

    accountTree.forEach(function (account) {
      account.subs = [];
      account.subs = account.children.map(function (child) {
        var balance = getBalance(child);
        return {id : child.id, account_number : child.account_number, account_txt : child.account_txt, is_asset : child.is_asset, balance : balance, formattedBalance : numeral(balance).format(formatDollar)};
      });
    });

    var selectedAccounts = [];
    var actif_total = 0;
    var passif_total = 0;

    accountTree.forEach(function (account){
      account.subs.forEach(function (sub) {
        sub.is_asset === 1 ? actif_total += sub.balance : passif_total += sub.balance;
        selectedAccounts.push(sub);
      });
    });

    context.actif_total = numeral(actif_total).format(formatDollar);
    context.passif_total = numeral(passif_total).format(formatDollar);
    context.sold = numeral(actif_total - passif_total).format(formatDollar);
    context.data = selectedAccounts;
    deferred.resolve(context);
  })
  .catch(deferred.reject)
  .done();

  return deferred.promise;
};
