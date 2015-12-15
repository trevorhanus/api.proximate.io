'use strict';

module.exports = function (db) {
  db.invites = {};
  db.invites.createInvite = createInvite;
  db.invites.isInvited = isInvited;
  db.invites.getInvitesByJobSite = getInvitesByJobSite;
  db.invites.updateInvitedBy = updateInvitedBy;

  function createInvite (invite) {
    return db
      .table('invites')
      .insert(invite, {returnChanges: true})
      .run()
      .then(function (result) {
        return result.changes[0].new_val;
      });
  }

  function isInvited (phoneNumberOrUserId, jobSiteId) {
    var index;
    if (phoneNumberOrUserId.length > 10) {
      index = 'userId';
    } else {
      index = 'phoneNumber';
    }

    return db
      .table('invites')
      .getAll(phoneNumberOrUserId, {index: index})
      .run()
      .then(function (invites) {
        for (var i = 0; i < invites.length; i++) {
          if (invites[i].jobSiteId === jobSiteId) {
            return invites[i];
          }
        }
        return null;
      });
  }

  function getInvitesByJobSite (jobSiteId) {
    return db
      .table('invites')
      .getAll(jobSiteId, {index: 'jobSiteId'})
      .run();
  }

  function updateInvitedBy (invitor, invite, isJobSiteAdmin) {
    return db
      .table('invites')
      .get(invite.id)
      .update({
        invitedBy: db.row('invitedBy').append(invitor), // Add the invitor to the invitedBy array
        invitedByAdmin: invite.invitedByAdmin ? true : isJobSiteAdmin // Update the invited by admin property
      }, {returnChanges: true})
      .run()
      .then(function (result) {
        return result.changes[0].new_val;
      });
  }
};
