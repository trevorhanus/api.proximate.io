'use strict';

var db = require('../../../lib/db');

module.exports = getGroups;

//////////

function getGroups (req, res, next) {
  db
    .table('groups')
    .getAll(req.jobSite.id, {index: 'jobSiteId'})
    .run()
    .then(function (groups) {
      res.status(200).send(groups);
    })
    .catch(next);
}
