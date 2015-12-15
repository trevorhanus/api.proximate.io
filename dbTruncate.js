'use strict';

var db = require('./lib/db');

module.exports = dbTruncate;

function dbTruncate() {
  return Promise.all([
    truncateCompanies(),
    truncateGroups(),
    truncateInvites(),
    truncateJobSites(),
    truncateMessages(),
    truncatePhoneNumberCodes(),
    truncateUsers()
  ]);
}

function truncateCompanies () {
  return db
    .table('companies')
    .delete()
    .run();
}

function truncateGroups () {
  return db
    .table('groups')
    .delete()
    .run();
}

function truncateInvites () {
  return db
    .table('invites')
    .delete()
    .run();
}

function truncateJobSites () {
  return db
    .table('jobSites')
    .delete()
    .run();
}

function truncateMessages () {
  return db
    .table('messages')
    .delete()
    .run();
}

function truncatePhoneNumberCodes () {
  return db
    .table('phoneNumberCodes')
    .delete()
    .run();
}

function truncateUsers () {
  return db
    .table('users')
    .delete()
    .run();
}
