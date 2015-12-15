'use strict';

var db = require('../../../lib/db');

module.exports = requestAccess;

//////////

function requestAccess (req, res, next) {
  var newUser = {
    id: req.user.id,
    name: req.user.firstName + ' ' + req.user.lastName,
    companyId: req.user.companyId,
    companyName: req.user.companyName
  };

  for(var i = 0; i < req.jobSiteMembers.length; i++) {
    if(req.jobSiteMembers[i].id === req.user.id) {
      return res.status(400).send('User is already a Member.');
    }
  }

  for(var i = 0; i < req.jobSitePending.length; i++) {
    if(req.jobSitePending[i].id === req.user.id) {
      return res.status(400).send('User already requested Access.');
    }
  }

  db
    .table('jobSites')
    .get(req.jobSite.id)
    .update({
      pending: db.row('pending').append(newUser)
    })
    .run()
    .then(function () {
      res.sendStatus(201);
    })
    .catch(next);
}
