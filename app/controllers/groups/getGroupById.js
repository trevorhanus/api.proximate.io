'use strict';

var db = require('../../../lib/db');

module.exports = getGroupById;

function getGroupById(req, res, next, id) {
  db
    .table('groups')
    .get(id)
    .run()
    .then(function (group) {
      req.group = group;
      next();
    })
    .catch(next);
}
