'use strict';

var db = require('../../../lib/db');

module.exports = getJobSiteById;

//////////

function getJobSiteById (req, res, next, id) {
  db
    .table('jobSites')
    .get(id)
    .run()
    .then(function (jobSite) {
      if(!jobSite) {
        return res.sendStatus(404);
      }

      req.jobSite = jobSite;
      req.jobSiteMembers = jobSite.members;
      req.jobSitePending = jobSite.pending;
      delete req.jobSite.members;
      delete req.jobSite.pending;

      req.isJobSiteMember = false;
      for(var i = 0; i < req.jobSiteMembers.length; i++) {
        if(req.jobSiteMembers[i].id === req.user.id) {
          //i = req.jobSiteMembers.length; // BReaks the code, no idea why??
          req.isJobSiteMember = true;
          if (req.jobSiteMembers[i].admin === true) {
            req.isJobSiteAdmin = true;
          } else {
            req.isJobSiteAdmin = false;
          }
        }
      }

      next();
    })
    .catch(next);
}
