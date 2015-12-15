'use strict';

var db = require('../../../lib/db');

module.exports = createJobSite;

//////////

function createJobSite (req, res, next) {
  var currentUser = {
    id: req.user.id,
    name: req.user.firstName + ' ' + req.user.lastName,
    admin: true
  };

  if (!req.body.name) {
    res.status(400).send('No job site name');
  }

  var jobSite = {
    name: req.body.name,
    lat: req.body.lat,
    long: req.body.long,
    address: req.body.address,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    generalContractor: req.user.companyId,
    members: [currentUser],
    pending: []
  };

  db
    .table('jobSites')
    .insert(jobSite, {returnChanges: true})
    .run()
    .then(function (newJobSite) {
      var jobSite = newJobSite.changes[0].new_val;

      var userJobSite = {
        id: jobSite.id,
        name: jobSite.name,
        companyId: req.user.companyId,
        companyName: req.user.companyName
      };

      return db
        .table('users')
        .get(currentUser.id)
        .update({
          jobSites: db.row('jobSites').append(userJobSite)
        })
        .run()
        .then(function () {
          res.status(201).send(jobSite);
        });
    })
    .catch(next);
}
