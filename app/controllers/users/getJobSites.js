'use strict';

var db = require('../../../lib/db');

module.exports = getJobSites;

function getJobSites (req, res, next) {
  db
    .table('users')
    .get(req.user.id)
    .run()
    .then(function (user) {
      user.jobSites.forEach(function (jobSite) {
        db.jobSites.isAdmin(user.id, jobSite.id)
          .then(function (isAdmin) {
            if (isAdmin) {
              jobSite.isAdmin = true;
            }
          });
      });
      res.status(200).send(user.jobSites);
    })
    .catch(next);
}
