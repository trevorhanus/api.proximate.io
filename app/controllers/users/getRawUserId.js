'use strict';

var db = require('../../../lib/db');

module.exports = getRawUserId;

function getRawUserId (req, res, next, id) {
  req.rawUserId = id;
  next();
}
