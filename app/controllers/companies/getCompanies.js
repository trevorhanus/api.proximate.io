'use strict';

var db = require('../../../lib/db');

module.exports = getCompanies;

function getCompanies (req, res, next) {
  db
    .table('companies')
    .run()
    .then(function (companies) {
      res.status(200).send(companies);
    })
    .catch(next);
}
