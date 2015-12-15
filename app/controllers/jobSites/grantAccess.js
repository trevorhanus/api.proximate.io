'use strict';

var db = require('../../../lib/db');

module.exports = grantAccess;

//////////

function grantAccess (req, res, next) {
  if(!req.isJobSiteAdmin) {
    return res.sendStatus(403);
  }

  var pending = req.jobSitePending;
  var found = false;
  for(var p = 0; p < pending.length; p++) {
    if(pending[p].id === req.rawUserId) {
      found = true;
      db.table('jobSites')
        .get(req.jobSite.id)
        .update({
          members: db.row('members').append(pending[p]),
          pending: db.row('pending').deleteAt(p)
        })
        .run()
        .then(function () {
          var userJobSite = {
            id: req.jobSite.id,
            name: req.jobSite.name
          };

          return db
            .table('users')
            .get(req.rawUserId)
            .update({
              jobSites: db.row('jobSites').append(userJobSite)
            })
            .run();
        })
        .then(function () {
          res.status(200).send('Access Granted');
        })
        .catch(next);
    }
  }
  // If the userId is not found in the pending list
  if (!found) {
    res.status(400).send({error: 'User has not requested access to that job site'});
  }
}
