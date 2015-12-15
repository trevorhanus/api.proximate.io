'use strict';

var db = require('../../../lib/db');
var twilio = require('../../../lib/twilio');

module.exports = invite;

//////////

function invite (req, res, next) {

  // Is invitor a member of the job site
  db.jobSites.isMember(req.user.id, req.jobSite.id)
    .then(function (isMember) {
      if (isMember) {
        // Is the invitee on bridge
        if (req.body.phoneNumber) { // Invitee is not on bridge
          inviteNonMember();
        } else if (req.body.userId) { // Invitee is on bridge
          inviteMember();
        } else {
          throw new Error('WTF did you send me?');
        }

      } else { // Invitor is not member of job site
        res.status(401).send('You are not a member of that job site');
      }
    })
    .catch(next);

  //////////

  function inviteNonMember () {
    // Check if phone number has already been invited
    db.invites.isInvited(req.body.phoneNumber, req.jobSite.id)
      .then(function (invite) {
        if (invite) { // Phone number has already been invited

          var invitor = {
            id: req.user.id,
            name: req.user.firstName + ' ' + req.user.lastName
          };

          //Update the invite record
          db.invites.updateInvitedBy(invitor, invite, req.isJobSiteAdmin)
            .then(function (invite) {
              sendNonMemberInvite();
            })
            .catch(next);

        } else { // User has not been previously invited
          invite = {
            jobSiteId: req.jobSite.id,
            phoneNumber: req.body.phoneNumber,
            invitedByAdmin: req.isJobSiteAdmin,
            invitedBy: [{
              id: req.user.id,
              name: req.user.firstName + ' ' + req.user.lastName
            }]
          };

          db.invites.createInvite(invite)
            .then(function (invite) {
              sendNonMemberInvite();
            })
            .catch(next);
        }
      })
      .catch(next);
  }

  function sendNonMemberInvite (invite) {
    // Is the invitor a job site admin
    if (req.isJobSiteAdmin) {
      twilio.sendInviteToBridge(req.body.phoneNumber);
      res.status(200).send('Invited');
    } else {
      // Notify job site admin
      // TODO: db.jobSites.notifyAdminOfInvite(invite);
      res.status(200).send('Invite created - Job site admin notified');
    }
  }

  function inviteMember () {
    // Check if user is trying to invite self
    if (req.body.userId === req.user.id) {
      res.status(400).send('You can\'t invite yourself');
    } else {
      // Check if userId is valid
      db.users.isMember(req.body.userId)
        .then(function (isMember) {
          if (!isMember) {
            res.status(400).send('Invalid userId');
          } else {
            // Check if user is already a member
            db.jobSites.isMember(req.body.userId, req.jobSite.id)
              .then(function (result) {
                if (result) {
                  res.status(400).send('User is already a member');
                } else {
                  createOrUpdateMemberInvite()
                    .then(function (invite) {
                      sendMemberInvite(invite);
                    })
                    .catch(next);
                }
              });
          }
        })
        .catch(next);
    }
  }

  function sendMemberInvite (invite) {
    // Is the invitor a job site admin
    if (req.isJobSiteAdmin) {
      // Send the user a notification
      // TODO: db.notifications.send(invite)
      res.status(200).send('Invited');
    } else { // The invitor is not a job site admin
      // Notify the job site admin of the invitation
      // req.user.id has invited req.body.userId to req.jobSite.id
      res.status(200).send('Invite created - Job site admin notified');
    }
  }

  function createOrUpdateMemberInvite () {
    // Check if userId has already been invited
    return db.invites.isInvited(req.body.userId, req.jobSite.id)
      .then(function (invite) {
        if (invite) { // UserId has already been invited

          var invitor = {
            id: req.user.id,
            name: req.user.firstName + ' ' + req.user.lastName
          };

          //Update the invite record
          return db.invites.updateInvitedBy(invitor, invite, req.isJobSiteAdmin);

        } else { // UserId has not been previously invited

          return db.users.getUserById(req.body.userId)
            .then(function (user) {

              if (user) {

                var invite = {
                  userId: user.id,
                  jobSiteId: req.jobSite.id,
                  invitedByAdmin: req.isJobSiteAdmin,
                  invitedBy: [{
                    id: req.user.id,
                    name: req.user.firstName + ' ' + req.user.lastName
                  }]
                };

                // Create a new invite
                return db.invites.createInvite(invite);
              } else {
                res.status(400).send('User does not exist');
              }
            });
        }
      });
  }
}
