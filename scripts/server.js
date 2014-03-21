// scripts/server.js

// import node dependencies
var express      = require('express'),
    domain       = require('domain'),
    url          = require('url');

// import configuration
var cfg = require('./config.json');

// import app dependencies
var parser       = require('./lib/database/parser')(),
    dblogger     = require('./lib/database/logger')(cfg.log),
    db           = require('./lib/database/db')(cfg.db, dblogger),
    sanitize     = require('./lib/util/sanitize'),
    tree         = require('./lib/tree')(db),
    app          = express();

// import middleware
var authorize    = require('./lib/auth/authorization')(db, cfg.auth.paths),
    authenticate = require('./lib/auth/authentication')(db),
    projects     = require('./lib/auth/projects')(db),
    errorHandler = require('./lib/error/handler');

// import routes
var report       = require('./lib/logic/report')(db),
    trialbalance = require('./lib/logic/trialbalance')(db),
    ledger       = require('./lib/logic/ledger')(db),
    fiscal       = require('./lib/logic/fiscal')(db),
    synthetic    = require('./lib/logic/synthetic')(db, sanitize),
    journal      = require('./lib/logic/journal')(db, synthetic),
    createSale   = require('./lib/logic/createSale')(db, parser, journal);

var uuid         = require('./lib/util/guid');

app.configure(function () {
  app.use(express.compress());
  app.use(express.bodyParser()); // FIXME: Can we do better than body parser?  There seems to be /tmp file overflow risk.
  app.use(express.cookieParser());
  app.use(express.session(cfg.session));
  app.use('/css', express.static('app/css', {maxAge:10000}));
  app.use('/lib', express.static('app/lib', {maxAge:10000}));
  app.use('/i18n', express.static('app/i18n', {maxAge:100000}));
  app.use(authenticate);
  app.use(authorize);
  app.use(projects);
  app.use(express.static(cfg.static, {maxAge : 10000}));
  app.use(app.router);
  app.use(errorHandler);
});

app.get('/', function (req, res, next) {
  // This is to preserve the /#/ path in the url
  res.sendfile('/index.html');
});

app.get('/data/', function (req, res, next) {
  var decode = JSON.parse(decodeURI(url.parse(req.url).query));
  var sql = parser.select(decode);
  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});

app.put('/data/', function (req, res, next) {
  // TODO: change the client to stop packaging data in an array...

  var updatesql = parser.update(req.body.table, req.body.data[0], req.body.pk[0]);

  db.execute(updatesql, function(err, ans) {
    if (err) return next(err);
    res.send(200, {insertId: ans.insertId});
  });
});

app.post('/data/', function (req, res, next) {
  // TODO: change the client to stop packaging data in an array...

  var insertsql = parser.insert(req.body.table, req.body.data);

  db.execute(insertsql, function (err, ans) {
    if (err) return next(err);
    res.send(200, {insertId: ans.insertId});
  });
});

app.delete('/data/:table/:column/:value', function (req, res, next) {
  var sql = parser.delete(req.params.table, req.params.column, req.params.value);
  db.execute(sql, function (err, ans) {
    if (err) return next(err);
    res.send(200);
  });
});

app.post('/sale/', function (req, res, next) {
  createSale.execute(req.body, req.session.user_id, function (err, ans) {
    if(err) return next(err);
    res.send(200, {saleId: ans});
  });
});

app.get('/currentProject', function (req, res, next) {
  var sql =
    "SELECT `project`.`id`, `project`.`name`, `project`.`abbr`, `project`.`enterprise_id`, `enterprise`.`currency_id`, `enterprise`.`location_id` " +
    "FROM `project` JOIN `enterprise` ON `project`.`enterprise_id`=`enterprise`.`id` " +
    "WHERE `project`.`id`=" + req.session.project_id + ";";
  db.execute(sql, function (err, result) {
    if (err) { return next(err); }
    res.send(result[0]);
  });
});

// FIXME: this is terribly insecure.  Please remove
app.get('/user_session', function (req, res, next) {
  res.send(req.session);
});

app.get('/trial/', function (req, res, next) {
  trialbalance.run(req.session.user_id, function (err, result) {
    if (err) return next(err);
    res.send(200, result);
  });
});

app.get('/post/:key', function (req, res, next) {
  trialbalance.postToGeneralLedger(req.session.user_id, req.params.key, function (err, result) {
    if (err) return next(err);
    res.send(200);
  });
});

app.get('/journal/:table/:id', function (req, res, next) {
  // What are the params here?
  journal.request(req.params.table, req.params.id, req.session.user_id, function (err, success) {
    if (err) return next(err);
    res.send(200);
  });
});

//FIXME receive any number of tables using regex
app.get('/max/:id/:table/:join?', function(req, res) {
  var id = req.params.id, table = req.params.table, join = req.params.join;

  var max_request = "SELECT MAX(" + id + ") FROM ";

  max_request += "(SELECT MAX(" + id + ") AS `" + id + "` FROM " + table;
  if(join) {
    max_request += " UNION ALL SELECT MAX(" + id + ") AS `" + id + "` FROM " + join + ")a;";
  } else {
    max_request += ")a;";
  }

  db.execute(max_request, function(err, ans) {
    if (err) {
      res.send(500, {info: "SQL", detail: err});
      console.error(err);
      return;
    }
    res.send({max: ans[0]['MAX(' + id + ')']});
  });
});

app.get('/ledgers/debitor/:id', function (req, res, next) {
  ledger.debitor(req.params.id, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});

app.get('/fiscal/:enterprise/:startDate/:endDate/:description', function(req, res) {
  var enterprise = req.params.enterprise;
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;
  var description = req.params.description;

  //console.time("FISCAL_KEY");
  //function(err, status);
  fiscal.create(enterprise, startDate, endDate, description, function(err, status) {
    if(err) return res.send(500, err);
    //console.timeEnd("FISCAL_KEY");
    res.send(200, status);
  });
});

app.get('/reports/:route/', function(req, res, next) {
  var route = req.params.route;

  //parse the URL for data following the '?' character
  var query = decodeURIComponent(url.parse(req.url).query);

  report(route, query, function(report, err) {
    if (err) { return next(err); }
    res.send(report);
  });
});

app.get('/InExAccounts/:id_enterprise/', function(req, res, next) {
  // var sql = "SELECT TRUNCATE(account.account_number * 0.1, 0) AS dedrick, account.id, account.account_number, account.account_txt, parent FROM account WHERE account.enterprise_id = '"+req.params.id_enterprise+"'"+
  // " AND TRUNCATE(account.account_number * 0.1, 0)='6' OR TRUNCATE(account.account_number * 0.1, 0)='7'";
  var sql = "SELECT account.id, account.account_number, account.account_txt, parent FROM account WHERE account.enterprise_id = '"+req.params.id_enterprise+"'";
  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(process(rows));
  });

  var process = function(accounts){
    var InExAccounts = accounts.filter(function(item){
      return item.account_number.toString().indexOf('6') === 0 || item.account_number.toString().indexOf('7') === 0;
    });
    return InExAccounts;
  };

});

app.get('/availablechargeAccounts/:id_enterprise/', function(req, res, next) {
  var sql = "SELECT account.id, account.account_number, account.account_txt FROM account WHERE account.enterprise_id = '"+req.params.id_enterprise+"' AND account.parent <> 0 AND account.cc_id = '-1'";

  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(process(rows));
  });

  var process = function(accounts){
    var availablechargeAccounts = accounts.filter(function(item){
      return item.account_number.toString().indexOf('6') === 0;
    });
    return availablechargeAccounts;
  };

});

app.get('/costCenterAccount/:id_enterprise/:cost_center_id', function(req, res, next) {
  // var sql = "SELECT TRUNCATE(account.account_number * 0.1, 0) AS dedrick, account.id, account.account_number, account.account_txt, parent FROM account WHERE account.enterprise_id = '"+req.params.id_enterprise+"'"+
  // " AND TRUNCATE(account.account_number * 0.1, 0)='6' OR TRUNCATE(account.account_number * 0.1, 0)='7'";
  var sql = "SELECT account.id, account.account_number, account.account_txt FROM account, cost_center WHERE account.cc_id = cost_center.id "+
            "AND account.enterprise_id = '"+req.params.id_enterprise+"' AND account.parent <> 0 AND account.cc_id='"+req.params.cost_center_id+"'";

  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(process(rows));
  });

  var process = function(accounts){
    var availablechargeAccounts = accounts.filter(function(item){
      return item.account_number.toString().indexOf('6') === 0;
    });
    return availablechargeAccounts;
  };

});

app.get('/auxiliairyCenterAccount/:id_enterprise/:auxiliairy_center_id', function(req, res, next) {
  // var sql = "SELECT TRUNCATE(account.account_number * 0.1, 0) AS dedrick, account.id, account.account_number, account.account_txt, parent FROM account WHERE account.enterprise_id = '"+req.params.id_enterprise+"'"+
  // " AND TRUNCATE(account.account_number * 0.1, 0)='6' OR TRUNCATE(account.account_number * 0.1, 0)='7'";
  var sql = "SELECT account.id, account.account_number, account.account_txt FROM account, auxiliairy_center WHERE account.auxiliairy_center_id = auxiliairy_center.id "+
            "AND account.enterprise_id = '"+req.params.id_enterprise+"' AND account.parent <> 0 AND account.auxiliairy_center_id='"+req.params.auxiliairy_center_id+"'";

  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(process(rows));
  });

  var process = function(accounts){
    var availablechargeAccounts = accounts.filter(function(item){
      return item.account_number.toString().indexOf('6') === 0;
    });
    return availablechargeAccounts;
  };

});

app.get('/tree', function (req, res, next) {
  tree.load(req.session.user_id)
  .then(function (treeData) {
    res.send(treeData);
  }, function (err) {
    res.send(301, err);
  });
});

app.get('/location/:villageId?', function (req, res, next) {
  var specifyVillage = req.params.villageId ? ' AND `village`.`uuid`=\"' + req.params.villageId + '\"' : '';

  var sql =
    'SELECT `village`.`uuid` as `uuid`,  `village`.`name` as `village`, ' +
      '`sector`.`name` as `sector`, `province`.`name` as `province`, ' +
      '`country`.`country_en` as `country` ' +
    'FROM `village`, `sector`, `province`, `country` ' +
    'WHERE village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid=country.uuid ' + specifyVillage + ';';

  db.execute(sql, function (err, rows) {
    if (err) { return next(err); }
    res.send(rows);
  });
});

app.get('/village/', function (req, res, next) {

  var sql =
    'SELECT `village`.`uuid` AS `uuid`,  `village`.`name` AS `village`, ' +
    '`sector`.`uuid` AS `sector_uuid`, `sector`.`name` as `sector` ' +
    'FROM `village`, `sector` ' +
    'WHERE village.`sector_uuid` = sector.uuid';

  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});

app.get('/sector/', function (req, res, next) {

  var sql = "SELECT `sector`.`uuid` as `uuid`,  `sector`.`name` as `sector`, `province`.`uuid` "+
            "as `province_uuid`, `province`.`name` as `province` FROM `sector`, `province` "+
            "WHERE `sector`.`province_uuid` = `province`.`uuid`";
  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});

app.get('/province/', function (req, res, next) {
  var sql =
    "SELECT `province`.`uuid` as `uuid`,  `province`.`name` as `province`, `country`.`uuid` "+
    "AS `country_uuid`, `country`.`country_en` as `country_en`, `country`.`country_fr` as `country_fr` FROM `province`, `country` "+
    "WHERE `province`.`country_uuid` = `country`.`uuid`";
  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});

// FIXME : make this code more modular
app.get('/visit/:patient_id', function (req, res, next) {
  var patient_id = req.params.patient_id;
  var sql =
    "INSERT INTO `patient_visit` (`uuid`, `patient_uuid`, `registered_by`) VALUES " +
    "(\"" + uuid() + "\"," + [patient_id, req.session.user_id].join(', ') + ");";
  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send();
  });
});

app.get('/caution/:debitor_id/:enterprise_id', function (req, res, next) {
  var debitor_id = req.params.debitor_id;
  //prochaine enterprise_id sera obtenue par requette via debitor_id

  var sql = 'SELECT `enterprise`.`currency_id` FROM enterprise WHERE `enterprise`.`id`='+sanitize.escape(req.params.enterprise_id)+';';
  db.execute(sql, function(err, ans){
    if(err) next(err);
    console.log("la donnee est ", ans);
    var sql2 =
      'SELECT `t`.`enterprise_id`, `t`.`id`, `t`.`trans_id`, `t`.`trans_date`, `t`.`debit_equiv` AS `debit`, ' +
        '`t`.`credit_equiv` AS `credit`, `t`.`currency_id`, `t`.`description`, `t`.`comment` ' +
        'FROM (' +
          '(' +
            'SELECT `posting_journal`.`enterprise_id`, `posting_journal`.`id`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, ' +
              '`posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_id`, `posting_journal`.`currency_id`, ' +
              '`posting_journal`.`doc_num`, `posting_journal`.`trans_id`, `posting_journal`.`description`, `posting_journal`.`comment`, `posting_journal`.`origin_id` ' +
            'FROM `posting_journal`' +
          ') UNION (' +
            'SELECT `general_ledger`.`enterprise_id`, `general_ledger`.`id`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, ' +
              '`general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_id`, `general_ledger`.`currency_id`, ' +
              '`general_ledger`.`doc_num`, `general_ledger`.`trans_id`, `general_ledger`.`description`, `general_ledger`.`comment`, `general_ledger`.`origin_id` ' +
            'FROM `general_ledger`' +
          ')' +
        ') AS `t`, `account` WHERE `t`.`account_id` = `account`.`id` AND `t`.`account_id` = '+
        '(SELECT `caution_account` FROM `currency_account` WHERE `currency_account`.`enterprise_id`='+sanitize.escape(req.params.enterprise_id)+' AND `currency_account`.`currency_id`='+sanitize.escape(ans[0].currency_id)+') AND `t`.`deb_cred_id`='+sanitize.escape(debitor_id)+';';
    db.execute(sql2, function (err, ans) {
      if(err) next(err);
      res.send(ans);
    });
  });
});

/*
app.get('/registrations/:id/:from/:to', function (req, res, next) {
  var from = new Date(req.params.from),
      to = new Date(req.params.to),
      id = req.params.id;

  var sql =
    "SELECT patient.id, debitor_id, first_name, last_name, dob, father_name, " +
      "sex, religion, renewal, registration_date, date " +
    "FROM `patient` JOIN `patient_visit` ON " +
    "`patient`.`id`=`patient_visit`.`patient_id` " +
    "WHERE `date` > " + sanitize.escape(from.toISOString().slice(0,10)) + " AND " +
    " `date` < " + sanitize.escape(to.toISOString().slice(0,10)) + ";";

  db.execute(sql, function (err, rows) {
    if (err) { return next(err); }
    res.send(rows);
  });
});
*/


app.get('/account_balance/:id', function (req, res, next) {
  // FIXME: put this in a module!
  var enterprise_id = req.params.id;

  var sql = 'SELECT temp.`id`, temp.`account_number`, temp.`account_txt`, account_type.`type`, temp.`parent`, temp.`fixed`, temp.`balance` FROM ' +
    '(' +
      'SELECT account.id, account.account_number, account.account_txt, account.account_type_id, account.parent, account.fixed, period_total.credit - period_total.debit as balance ' +
      'FROM account LEFT JOIN period_total ' +
      'ON account.id=period_total.account_id ' +
      'WHERE account.enterprise_id=' + sanitize.escape(enterprise_id) +
    ') ' +
    'AS temp JOIN account_type ' +
    'ON temp.account_type_id=account_type.id ORDER BY temp.account_number;';

  db.execute(sql, function (err, rows) {
    if (err) return next(err);
    res.send(rows);
  });
});


app.get('/synthetic/:goal/:enterprise_id?', function (req, res, next) {
  var query = decodeURIComponent(url.parse(req.url).query);
  synthetic(req.params.goal, req.params.enterprise_id, query, function (err, data) {
    if (err) { return next(err); }
    res.send(data);
  });
});

app.listen(cfg.port, console.log("Application running on localhost:" + cfg.port));

// temporary error handling for development!
process.on('uncaughtException', function (err) {
  console.log('uncaughtException:', err);
  process.exit();
});

// temporary debugging to see why the process terminates.
process.on('exit', function () { console.log('Process Shutting Down...'); });
