'use strict';

module.exports = function (db) {
  db.users = {};
  db.users.addGroup = addGroup;
  db.users.getUserById = getUserById;
  db.users.getUserByPhoneNumber = getUserByPhoneNumber;
  db.users.isPhoneUnique = isPhoneUnique;
  db.users.isMember = isMember;

  function addGroup (group, userId) {
    return db
      .table('users')
      .get(userId)
      .update({
        groups: db.row('groups').append(group)
      })
      .run();
  }

  function getUserById (id) {
    return db
      .table('users')
      .get(id)
      .run();
  }

  function getUserByPhoneNumber (phoneNumber) {
    return db
      .table('users')
      .getAll(phoneNumber, {index: 'phoneNumber'})
      .run()
      .then(function (users) {
        if(users.length === 1) {
          return users[0];
        } else {
          return null;
        }
      });
  }

  function isPhoneUnique (phone) {
    return db
      .table('users')
      .getAll(phone, {index: 'phoneNumber'})
      .run()
      .then(function (result) {
        if (result.length > 0) {
          return false;
        } else {
          return true;
        }
      });
  }

  function isMember (userId) {
    return db
      .table('users')
      .get(userId)
      .run()
      .then(function (result) {
        if (result) {
          return true;
        } else {
          return false;
        }
      });
  }
};
