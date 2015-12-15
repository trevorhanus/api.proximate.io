'use strict';

var login = require('../login/login');
var db = require('../../../lib/db');
var bcrypt = require('bcryptjs');

module.exports = signup;

function signup (req, res, next) {
  // Get info from req
  var user = {};
  user.phoneNumber = req.body.phoneNumber.trim();
  user.firstName = req.body.firstName.trim();
  user.firstName = user.firstName[0].toUpperCase() + user.firstName.slice(1);
  user.lastName = req.body.lastName.trim();
  user.lastName = user.lastName[0].toUpperCase() + user.lastName.slice(1);
  user.displayName = user.firstName + ' ' + user.lastName;
  user.email = req.body.email.trim().toLowerCase();
  user.password = bcrypt.hashSync(req.body.password, 10);
  user.jobSites = [];
  user.groups = [];
  user.directMessages = [];
  user.companyId = null;
  user.companyName = null;

  // add the user to the database

  db
    .table('users')
    .insert(user)
    .then(function () {
      // res.sendStatus(201);
      login(req, res, next);
    })
    .catch(next);
}
