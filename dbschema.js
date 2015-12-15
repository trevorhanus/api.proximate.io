'use strict';

var db = require('./lib/db');

createUsers()
  .then(createCompanies)
  .then(createGroups)
  .then(createJobSites)
  .then(createMessages)
  .then(createPhoneNumberCodes)
  .then(createUserCompanies)
  .then(createUserGroups)
  .then(createUserJobSites)
  .then(done)
  .catch(doneFail);

//////////

function createCompanies () {
  return db.schema.createTable('companies', function (table) {
    table.increments();
    table.string('name');
    table.string('address');
    table.string('address2');
    table.string('city');
    table.string('state');
    table.string('zip');
    table.string('logoUrl');
    table.string('phoneNumber');
    table.timestamps();
  });
}

function createGroups () {
  return db.schema.createTable('groups', function (table) {
    table.increments();
    table.string('name');
    table.enu('type', ['private', 'public', 'direct']);
    table.integer('jobSiteId');
    table.timestamps();
  });
}

function createJobSites () {
  return db.schema.createTable('jobSites', function (table) {
    table.increments();
    table.string('name');
    table.string('lat');
    table.string('long');
    table.integer('generalContractor'); // companyId
    table.timestamps();
  });
}

function createMessages () {
  return db.schema.createTable('messages', function (table) {
    table.increments();
    table.string('content');
    table.enu('type', ['info', 'text', 'picture', 'safety', 'file']);
    table.integer('userId');
    table.integer('groupId');
    table.timestamps();
  });
}

function createPhoneNumberCodes () {
  return db.schema.createTable('phoneNumberCodes', function (table) {
    table.increments();
    table.string('phoneNumber').unique().notNullable();
    table.string('code').notNullable();
    table.timestamps();
    //table.dateTime('createdAt');
    //table.dateTime('updatedAt');
  });
}

function createUserCompanies () {
  return db.schema.createTable('userCompanies', function (table) {
    table.integer('userId');
    table.integer('companyId');
    table.enu('role', ['owner', 'manager', 'employee']);
  });
}

function createUserGroups () {
  return db.schema.createTable('userGroups', function (table) {
    table.integer('userId');
    table.integer('groupId');
  });
}

function createUserJobSites () {
  return db.schema.createTable('userJobSites', function (table) {
    table.integer('userId');
    table.integer('jobSiteId');
  });
}

function createUsers () {
  return db.schema.createTable('users', function (table) {
    table.increments();
    table.string('firstName');
    table.string('lastName');
    table.string('email').unique();
    table.string('phoneNumber').unique();
    table.string('password');
    table.string('salt'); // TODO: Remove
    table.string('profileImage');
    table.timestamps();
  });
}

function done (data) {
  console.log('');
  console.log('Done');
  console.log('');
  process.exit(0);
}

function doneFail (error) {
  console.error('');
  console.error(error);
  console.error('');
  process.exit(1);
}
