'use strict';

var db = require('../../../lib/db');

module.exports = getJobSites;

//////////

function getJobSites (req, res, next) {
  db
    .table('jobSites')
    .run()
    .then(function (jobsites) {
      if(req.query.filterMineOut === 'true') {
        var _jobsites = [];
        for(var i=0; i < jobsites.length; i++) {
          var isMember = false;
          for(var j=0; j < jobsites[i].members.length; j++) {
            if(jobsites[i].members[j].id === req.user.id) {
              isMember = true;
            }
          }
          if(!isMember) {
            addUserStatusToJobSite(jobsites[i], req.user.id);
            _jobsites.push(jobsites[i]);
          }
        }
        jobsites = _jobsites;
      }
      res.status(200).send(jobsites);
    })
    .catch(next);
}

function addUserStatusToJobSite (jobSite, userId) {
  jobSite.pending.forEach(function (member) {
    if (member.id === userId) {
      jobSite.status = 'pending request';
    }
  });
}
