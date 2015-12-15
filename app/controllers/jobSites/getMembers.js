'use strict';

var db = require('../../../lib/db');

module.exports = getMembers;

//////////

function getMembers (req, res, next) {
  var members = {};
  members.members = req.jobSiteMembers;

  // Check if user is a member of the job site
  db.jobSites.isMember(req.user.id, req.jobSite.id)
    .then(function (result) {
      if (result) {
        db.invites.getInvitesByJobSite(req.jobSite.id)
          .then(function (invites) {
            if(req.isJobSiteAdmin) {
              members.pending = req.jobSitePending;
              members.invited = invites;
            } else {
              members.invited = [];
              invites.forEach(function (invite) {
                invite.invitedBy.forEach(function (invitor) {
                  if(invitor.id === req.user.id) {
                    members.invited.push(invite);
                  }
                });
              });
            }
            res.status(200).send(members);
          })
          .catch(next);
        } else {
          res.status(401).send('You are not a member');
        }
    });
}
