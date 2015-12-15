'use strict';

var db = require('../../../lib/db');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var jwt = require('jsonwebtoken');

module.exports = login;

//////////

function login (req, res, next) {
  var privateKey  = fs.readFileSync('ssl/key.pem', 'utf8');

  db
    .table('users')
    .getAll(req.body.phoneNumber, {index: "phoneNumber"})
    .run()
    .then(function (userArray) {
      // compare password
      if (userArray.length !== 1) {
        res.status(400).send('invalid user');
      } else {
        var user = userArray[0];
        if (bcrypt.compareSync(req.body.password, user.password)) {
          var data = {};

          data.token = jwt.sign(user, privateKey);

          data.user = user;
          delete data.user.password;

          res.status(200).send(data);
        } else {
          res.status(400).send('invalid password');
        }
      }
    })
    .catch(next);
}
