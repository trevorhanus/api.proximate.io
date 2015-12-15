'use strict';

var db = require('../../../lib/db');

module.exports = joinGroup;

function joinGroup (req, res, next) {
  var newUser = {
    id: req.user.id,
    name: req.user.firstName + ' ' + req.user.lastName
  };

  db
    .table('groups')
    .get(req.group.id)
    .update({
      members: db.row('members').append(newUser)
    })
    .run()
    .then(function () {
      var newGroup = {
        id: req.group.id,
        name: req.group.name
      };
      return db.users.addGroup(newGroup, req.user.id);
    })
    .then(function () {
      res.status(200).send('Welcome');
    })
    .catch(next);
}
