'use strict';

var db = require('../../../lib/db');

module.exports = getGroup;

function getGroup (req, res) {
  res.status(200).send(req.group);
}
