'use strict';

var c = require('../../lib/controllers');

module.exports = coreRoutes;

//////////

function coreRoutes (app) {

  // Companies
  app.route('/api/companies')
    .get(c.companies.getCompanies)
    .post(c.companies.createCompany);

  // Groups
  app.route('/api/groups')
    .post(c.groups.createGroup);
  app.route('/api/groups/:groupId')
    .get(c.groups.getGroup);
  app.route('/api/groups/:groupId/join')
    .post(c.groups.joinGroup);

  app.route('/api/groups/:groupId/messages')
    .get(c.groups.getMessages);

  // JobSites
  app.route('/api/jobsites')
    .get(c.jobSites.getJobSites)
    .post(c.jobSites.createJobSite);

  app.route('/api/jobsites/:jobSiteId/request')
    .post(c.jobSites.requestAccess);

  // TODO: Admin can Grant JobSite Access to User
  app.route('/api/jobsites/:jobSiteId/grant/:rawUserId')
    .post(c.jobSites.grantAccess);

  app.route('/api/jobsites/:jobSiteId/invite')
    .post(c.jobSites.invite);
    // if not on bridge, invite to bridge and add to jobsite upon creation of user

  // Job Site admin approve an invite to a jobsite and then send a notification/text message
  app.route('/api/jobsites/:jobSiteId/approve')
    .post(c.jobSites.approve);

  // TODO: Accept an Invitation to join a jobsite

  app.route('/api/jobsites/:jobSiteId')
    .get(c.jobSites.getJobSite);

  app.route('/api/jobsites/:jobSiteId/members')
    .get(c.jobSites.getMembers);

  app.route('/api/jobsites/:jobSiteId/groups')
    .get(c.jobSites.getGroups);

  // TODO: Send a Message
  app.route('/api/messages')
    .post(c.messages.createMessage);

  app.route('/api/messages/:messageId/seen')
    .post(c.messages.seenMessage);

  // TODO: Create a Notification

  // TODO: Mark a Ntofication as Read (aka DELETE from database)

  app.route('/api/users')
    .get(c.users.getUsers);

  app.route('/api/users/:userId')
    .put(c.users.updateUser);

  app.route('/api/users/me/jobsites')
    .get(c.users.getJobSites);

  app.route('/api/users/me/company')
    .get(c.users.getCompany);

  app.param('groupId', c.groups.getGroupById);
  app.param('jobSiteId', c.jobSites.getJobSiteById);
  app.param('messageId', c.messages.getMessageById);
  app.param('userId', c.users.getUserById);
  app.param('rawUserId', c.users.getRawUserId);

}
