'use strict';

var expect = require('chai').expect;
var app = require('../../lib/express');
var db = require('../../lib/db');
var request = require('supertest');

describe('Signup Controller', function () {

  beforeEach(function () {
    db
      .table('users')
      .delete()
      .run();
  });

  var homer = {
    phoneNumber: '5555555555',
    firstName: 'homer',
    lastName: 'simpson',
    email: 'hOmer@siMpson.com  ',
    password: 'derp1234'
  };

  it('should add a user to the database', function (done) {
    request(app)
      .post('/api/signup/signup')
      .send(homer)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('users')
            .run()
            .then(function (users) {
              expect(users.length).to.equal(1);
              done();
            });
        }
      });
  });

  it('should add and format the given user info', function (done) {
    request(app)
      .post('/api/signup/signup')
      .send(homer)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('users')
            .run()
            .then(function (users) {
              expect(users[0].firstName).to.equal('Homer');
              expect(users[0].lastName).to.equal('Simpson');
              expect(users[0].email).to.equal('homer@simpson.com');
              expect(users[0].phoneNumber).to.equal('5555555555');
              done();
            });
        }
      });
  });

});
