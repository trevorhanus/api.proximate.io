'use strict';

var db = require('../../../lib/db');

module.exports = getUsers;

function getUsers (req, res, next) {
  db
    .table('users')
    .run()
    .then(function (users) {
      var u = [];
      users.forEach(function (user) {
        var n = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        };
        u.push(n);
      });
      res.send(u);
    })
    .catch(next);
}
