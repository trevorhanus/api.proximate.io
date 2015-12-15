'use strict';

var db = require('./lib/db');

module.exports = dbSetUp;

function dbSetUp () {
  return Promise.all([
    setUpCompanies(),
    setUpGroups(),
    setUpInvites(),
    setUpJobSites(),
    setUpMessages(),
    setUpPhoneNumberCodes(),
    setUpUsers()
  ]);
}

function setUpCompanies () {
  return db
    .tableCreate('companies')
    .run();
}

function setUpGroups () {
  return db
    .tableCreate('groups')
    .run()
    .then(function () {
      return db
        .table('groups')
        .indexCreate('jobSiteId')
        .run();
    })
    .then(function () {
      return db
        .table('groups')
        .indexWait()
        .run();
    });
}

function setUpInvites () {
  return db
    .tableCreate('invites')
    .run()
    .then(function () {
      return db
        .table('invites')
        .indexCreate('jobSiteId')
        .run();
    })
    .then(function () {
      return db
        .table('invites')
        .indexCreate('phoneNumber')
        .run();
    })
    .then(function () {
      return db
        .table('invites')
        .indexCreate('userId')
        .run();
    })
    .then(function () {
      return db
        .table('invites')
        .indexWait()
        .run();
    });
}

function setUpJobSites () {
  return db
    .tableCreate('jobSites')
    .run();
}

function setUpMessages () {
  return db
    .tableCreate('messages')
    .run()
    .then(function () {
      return db
        .table('messages')
        .indexCreate('groupIdAndCreatedAt')
        .run();
    })

    .then(function () {
      return db
        .table('messages')
        .indexWait()
        .run();
    });
}

function setUpPhoneNumberCodes () {
  return db
    .tableCreate('phoneNumberCodes')
    .run()
    .then(function () {
      return db
        .table('phoneNumberCodes')
        .indexCreate('phoneNumber')
        .run();
    })
    .then(function () {
      return db
        .table('phoneNumberCodes')
        .indexWait()
        .run();
    });
}

function setUpUsers () {
  return db
    .tableCreate('users')
    .run()
    .then(function () {
      return db
        .table('users')
        .indexCreate('phoneNumber')
        .run();
    })
    .then(function () {
      return db
        .table('users')
        .indexWait()
        .run();
    });
}
