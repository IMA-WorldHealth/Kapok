// patient controller

var db = require('../lib/db'),
    guid = require('../lib/guid');

// assure the array is empty
function empty(array) {
  return array.length === 0;
}

// GET /patient/:uuid
// Get a patient by uuid
exports.searchUuid = function (req, res, next) {
  'use strict';

  var sql, uuid = req.params.uuid;

  // compose the sql query
  sql =
    'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name, ' +
      'p.sex, p.dob, p.origin_location_id, p.reference, proj.abbr, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
    'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
    'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id' +
    'WHERE p.uuid = ?;';

  db.exec(sql, [uuid])
  .then(function (rows) {

    // if the database cannot find the record
    // return a 404 'resource not found'
    if (empty(rows)) {
      res.status(404).send();
    } else {
      res.status(200).json(rows[0]);
    }

  })
  .catch(next)
  .done();
};

// GET /patient/search/reference/:reference
// Performs a search on the patient reference (e.g. HBB123)
exports.searchReference = function (req, res, next) {
  'use strict';

  var sql, reference = req.params.reference;

  // use MYSQL to look up the reference
  // TODO This could probably be optimized
  sql =
    'SELECT q.uuid, q.project_id, q.debitor_uuid, q.first_name, q.last_name, ' +
      'q.sex, q.dob, q.origin_location_id, q.reference, q.text, ' +
      'q.account_id, q.price_list_uuid, q.is_convention, q.locked ' +
    'FROM (' +
      'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name, ' +
      'p.sex, p.dob, CONCAT(proj.abbr, p.reference) AS reference, p.origin_location_id, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
      'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
        'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id' +
    ') AS q ' +
    'WHERE q.reference = ?;';

  db.exec(sql, [reference])
  .then(function (rows) {

    if (empty(rows)) {
      res.status(404).send();
    } else {
      res.status(200).json(rows[0]);
    }

  })
  .catch(next)
  .done();

};

// GET /patient/search/fuzzy/:match
// Performs fuzzy searching on patient names
exports.searchFuzzy = function (req, res, next) {
  'use strict';

  var sql, match = req.params.match;

  if (!match) { next(new Error('No parameter provided!')); }

  // Do fuzzy searching on the match parameter
  sql =
    'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name, ' +
      'p.sex, p.dob, p.origin_location_id, p.reference, proj.abbr, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
    'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
    'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id ' +
    'WHERE LEFT(LOWER(CONCAT(p.first_name, \' \', p.last_name)), CHAR_LENGTH(?)) = ? OR ' +
      'SOUNDEX(p.first_name) = SOUNDEX(?) OR ' +
      'SOUNDEX(p.last_name) = SOUNDEX(?) OR ' +
      'SOUNDEX(CONCAT(p.first_name, \' \', p.last_name)) = SOUNDEX(?) ' +
    'LIMIT 10;';

  db.exec(sql, [match, match, match, match, match])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


// POST /patient/visit/start
exports.startVisit = function (req, res, next) {
  'use strict';

  var sql, patientId = req.params.patientId;

  sql =
    'INSERT INTO patient_visit (uuid, patient_uuid, entry_date, registered_by) VALUES ' +
    '(?, ?, ?, ?);';

  db.exec(sql, [guid(), patientId, new Date(), req.session.user_id])
  .then(function () {
    res.status(200).send();
  })
  .catch(next)
  .done();
};

