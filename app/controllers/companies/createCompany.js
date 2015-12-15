'use strict';

var db = require('../../../lib/db');

module.exports = createCompany;

function createCompany (req, res, next) {
  var company = {
    name: req.body.name,
    address: req.body.address,
    address2: req.body.address2 || "",
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    logoUrl: null,
    phoneNumber: req.body.phoneNumber
  };

  db
    .table('companies')
    .insert(company)
    .run()
    .then(function (data) {
      return db
        .table('users')
        .get(req.user.id)
        .update({companyId: data.generated_keys[0]})
        .run();
    })
    .then(function (resp) {
      res.status(201).send(req.user.id);
    })
    .catch(next);
}
