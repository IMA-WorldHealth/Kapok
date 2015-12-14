/**
* Cashboxes Controller
*
* This controller is responsible for creating and updating cashboxes.  Every
* cashbox must have a name, and as many accounts as there are currencies
* supported by the application.
*/
var db = require('../../lib/db');

/*
* TODO - PROPOSAL: rename cash_box to cashbox in the database.  Easier for everything
* in life.
*/

// FIXME -- For some reason, is_bank can be null.

/**
* GET /cashboxes
* Lists available cashboxes, defaulting to all in the database.  Pass in the
* optional parameters:
*  1) project_id={id}
*  2) is_auxillary={1|0}
*  3) is_bank={1|0}
* to filter results appropriately.
*/
exports.list = function list(req, res, next) {
  'use strict';

  var sql,
      possibleConditions = ['project_id', 'is_auxillary', 'is_bank'],
      providedConditions = Object.keys(req.query),
      conditions = [];

  sql =
    'SELECT id, text FROM cash_box ';

  // loop through conditions if they exist, escaping them and adding them
  // to the query string.
  if (providedConditions.length > 0) {
    possibleConditions.forEach(function (k) {
      var key = req.query[k];

      // if the key exists, add it to a list of growing conditions
      if (key) {
        conditions.push(k + ' = ' + db.sanitize(key));
      }
    });
  }

  // if we have actual matches, concatenate them into a WHERE condition
  if (conditions.length > 0) {
    sql += 'WHERE ' + conditions.join(' AND ');
  }

  sql += ';';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// get cashboxes
function helperGetCashbox(id, codes) {
  'use strict';

  var sql,
      cashbox;

  sql =
    'SELECT id, text, project_id, is_auxillary, is_bank FROM cash_box ' +
    'WHERE id = ?;';

  return db.exec(sql, [id])
  .then(function (rows) {

    if (!rows.length) {
      throw codes.NOT_FOUND;
    }

    cashbox = rows[0];

    // query the currencies supported by this cashbox
    sql =
      'SELECT currency_id, account_id, gain_exchange_account_id, ' +
        'loss_exchange_account_id, virement_account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_id = ?;';

    return db.exec(sql, [cashbox.id]);
  })
  .then(function (rows) {

    // assign the currencies to the cashbox
    cashbox.currencies = rows;

    return cashbox;
  });
}

/**
* GET /cashboxes/:id
*
* Returns the details of a specific cashbox, including the supported currencies
* and their accounts.
*/
exports.details = function details(req, res, next) {
  'use strict';

  helperGetCashbox(req.params.id, req.codes)
  .then(function (cashbox) {
    res.status(200).json(cashbox);
  })
  .catch(next)
  .done();
};

// POST /cashboxes
exports.create = function create(req, res, next) {
  'use strict';

  var sql,
      box = req.body.cashbox;

  sql = 'INSERT INTO cash_box (text, project_id, is_auxillary, is_bank) VALUES (?);';

  db.exec(sql, [[box.text, box.project_id, box.is_auxillary, box.is_bank]])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /cashboxes/:id
exports.update = function update(req, res, next) {
  'use strict';

  var sql;

  sql = 'UPDATE cash_box SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function (rows) {
    return helperGetCashbox(req.params.id, req.codes);
  })
  .then(function (cashbox) {
    res.status(200).json(cashbox);
  })
  .catch(next)
  .done();
};


// DELETE /cashboxes/:id
exports.delete = function del(req, res, next) {
  'use strict';

  var sql;

  sql = 'DELETE FROM cash_box WHERE id = ?';

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).send();
  })
  .catch(next)
  .done();
};

// API for cashbox currencies
exports.currencies = {};

// GET /cashboxes/:id/currencies
exports.currencies.list = function listCurrencies(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, currency_id, loss_exchange_account_id, account_id, ' +
      'gain_exchange_account_id, virement_account_id ' +
    'FROM cash_box_account_currency WHERE cash_box_id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// GET /cashboxes/:id/currencies/:currencyId
exports.currencies.details = function detailCurrencies(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, loss_exchange_account_id, account_id, ' +
      'gain_exchange_account_id, virement_account_id ' +
    'FROM cash_box_account_currency ' +
    'WHERE cash_box_id = ? AND currency_id = ?;';

  db.exec(sql, [req.params.id, req.params.currencyId])
  .then(function (rows) {
    if (rows.length === 0) {
      throw req.codes.NOT_FOUND;
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

// POST /cashboxes/:id/currencies
exports.currencies.create = function createCurrency(req, res, next) {
  'use strict';

  var sql;
  var data = req.body;
  data.cashbox_id = req.params.id;

  sql =
    'INSERT INTO cash_box_account_currency (' +
      'currency_id, account_id, virement_account_id, gain_exchange_account_id, ' +
      'loss_exchange_account_id, cash_box_id ' +
    ') VALUES (?);';

  db.exec(sql, [[
    data.currency_id, data.account_id, data.virement_account_id,
    data.gain_exchange_account_id, data.loss_exchange_account_id,
    data.cashbox_id
  ]]).then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /cashboxes/:id/currencies/:currencyId
exports.currencies.update = function updateCurrency(req, res, next) {
  'use strict';

  var sql;
  var data = req.body;

  sql =
    'UPDATE cash_box_account_currency SET ? ' +
    'WHERE cash_box_id = ? AND currency_id = ?;';

  db.exec(sql, [data, req.params.id, req.params.currencyId])
  .then(function (result) {

    // send the changed object to the client
    sql =
      'SELECT id, loss_exchange_account_id, account_id, ' +
        'gain_exchange_account_id, virement_account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_id = ? AND currency_id = ?;';

    return db.exec(sql, [req.params.id, req.params.currencyId ]);
  })
  .then(function (rows) {

    // in case an unknown id is sent to the server
    if (!rows.length) {
      return res.status(200).json({});
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};
