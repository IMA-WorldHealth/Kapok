// /scripts/lib/database/db.js

// Module: db.js

// The purpose of this module is managing client connections
// and disconnections to a variety of database management systems.
// All query formatting is expected to happen elsewhere.

var u = require('../util/util');

function mysqlInit (config) {
  'use strict';
  var db = require('mysql');
  console.log('Creating connection pool...');
  return db.createPool(config);
}

function flushUsers (db_con) {
  'use strict';
  var permissions, reset;

  // Disable safe mode #420blazeit
  permissions = 'SET SQL_SAFE_UPDATES = 0;';
  reset = 'UPDATE `kpk`.`user` SET `logged_in`="0" WHERE `logged_in`="1";';

  // Mwahahahaha
  db_con.getConnection(function (err, con) {
    if (err) throw err;
    con.query(permissions, function (err, res) {
      if (err) throw err;
      con.release();
      db_con.getConnection(function (err, con) {
        if (err) throw err;
        con.query(reset, function (err) {
          if (err) throw err;
          console.log('[db.js] (*) user . logged_in set to 0');
        });
      });
    });
  });
}

// TODO: impliment PostgreSQL support
function postgresInit(config) {
  db = require('pg');
  return true;
}

// TODO: impliment Firebird support
function firebirdInit(config) {
  db = require('node-firebird');
  return true;
}

// TODO: impliment sqlite support
function sqliteInit(config) {
  db = require('sqlite3');
  return true;
}

module.exports = function (cfg, logger) {
  'use strict';

  cfg = cfg || {};

  // Select the system's database with this variable.
  var dbms = cfg.dbms || 'mysql';

  // All supported dabases and their initializations
  var supported_databases = {
    mysql    : mysqlInit,
    postgres : postgresInit,
    firebird : firebirdInit,
    sqlite   : sqliteInit
  };

  // The database connection for all data interactions
  var con = supported_databases[dbms](cfg);
  logger.emit('credentials', cfg);

  //  FIXME reset all logged in users on event of server crashing / terminating - this should be removed/ implemented into the error/ loggin module before shipping
  flushUsers(con);

  return {
    // return all supported databases
    getSupportedDatabases : function() {
      return Object.keys(supported_databases);
    },
    
    execute: function(sql, callback) {
      // This fxn is formated for mysql pooling, not in all generality
      console.log("[db] [execute]: ", sql);
      logger.emit('log', sql);

      con.getConnection(function (err, connection) {
        if (err) return callback(err);
        connection.query(sql, function (err, results) {
          connection.release();
          if (err) return callback(err);
          return callback(null, results);
        });
      });
    }
  };
};
