'use strict';

var db = require('../../../lib/db');

module.exports = approve;

//////////

  /**
   * approve - Allows a job site admin to approve an invite
`  *-----------------------------------------------
   * @params {object} req Request object
   * properties:  req.body.userId (optional) userId of the user to approve
   *              res.body.phoneNumber (optional) phone number to approve
   *
   */

function approve (req, res, next) {
  if (!req.body.phoneNumber && !req.body.userId) {
    res.status(400).send('No phone number or userId');
  } else {
    // Verify that the approver is a job site admin
    if (req.isJobSiteAdmin) {
      // Find the invite
      db.invites.isInvited(req.body.phoneNumber || req.body.userId, req.jobSite.id)
        .then(function (invite) {
          if (invite && invite.invitedByAdmin) {
            res.status(400).send('Invite was already approved');
          } else if (invite) {
            var invitor = {
              id: req.user.id,
              name: req.user.firstName + ' ' + req.user.lastName
            };

            //Update the invite record
            db.invites.updateInvitedBy(invitor, invite, req.isJobSiteAdmin)
              .then(function (invite) {
                // TODO: db.notifications.sendInvite(invite);
                res.status(200).send('Approved');
              })
              .catch(next);
          } else {
            // Not a valid phone number or userId
            res.status(400).send('No invite found');
          }
        })
        .catch(next);
    } else {
      res.status(403).send('Not an admin');
    }
  }
}
