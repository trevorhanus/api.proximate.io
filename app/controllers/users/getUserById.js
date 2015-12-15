'use strict';

var db = require('../../../lib/db');

module.exports = getUserById;

function getUserById(req, res, next, id) {
  if(id !== req.user.id) {
    res.sendStatus(403);
  } else {
    res.userId = id;
    next();
  }
}
