'use strict';

var app = require('./express');
var db = require('./db');
var request = require('supertest');

exports.createMockUser = createMockUser;
exports.createMockJobSite = createMockJobSite;
exports.dropTable = dropTable;

function createMockUser () {
  return new Promise(function (resolve, reject) {
    // generate a random code and convert to a string
    var phone = String(Math.floor(Math.random() * 10000000000));

    // We need to make sure the code has 4 digits so append a 0 to the beginning if needed.
    while (phone.length < 10) {
      phone = '0' + phone;
    }

    var num = String(Math.floor(Math.random() * 1000000));

    var user = {
      phoneNumber: phone,
      firstName: 'Homer' + num,
      lastName: 'Simpson' + num,
      email: 'homer'+ num + '@simpson.com',
      password: 'derp1234'
    };

    request(app)
      .post('/api/signup/signup')
      .send(user)
      .end(function (err, res) {
        db
          .table('users')
          .getAll(user.phoneNumber, {index: 'phoneNumber'})
          .run()
          .then(function (users) {
            var newUser = users[0];
            newUser.token = res.body.token;
            resolve(newUser);
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
}

function createMockJobSite (user) {
  return new Promise (function (resolve, reject) {

    var name = String(Math.floor(Math.random() * 1000000));

    request(app)
    .post('/api/jobsites')
    .set('x-access-token', user.token)
    .send({
      name: name
    })
    .end(function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    });
  });
}

function dropTable (tableName) {
  return db
    .table(tableName)
    .delete()
    .run();
}
