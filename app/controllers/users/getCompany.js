'use strict';

var db = require('../../../lib/db');

module.exports = getCompany;

function getCompany (req, res, next) {
  if(!req.user.companyId) {
    res.status(200).send(null);
  } else {
    db
    .table('companies')
    .get(req.user.companyId)
    .run()
    .then(function (company) {
      res.status(200).send(company);
    })
    .catch(next);
  }
}
