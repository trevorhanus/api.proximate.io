'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');

describe('isPhoneUnique Controller Tests `/api/signup/isPhoneUnique`', function () {

  before(function (done) {
    // Create a user for testing
    db
      .table('users')
      .insert({ phoneNumber: '8987776767' })
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });

  it('should respond with 400 when no phoneNumber specified', function (done) {
    request(app)
      .post('/api/signup/isPhoneUnique')
      .expect(400)
      .end(done);
  });

  it('should respond with 200 when phoneNumber is not duplicated', function (done) {
    request(app)
      .post('/api/signup/isPhoneUnique')
      .send({
        phoneNumber: '1234567890'
      })
      .expect(200)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body.unique).to.equal(true);
          done();
        }
      });
  });

  it('should respond with 409 when a phoneNumber is duplicated', function (done) {
    request(app)
      .post('/api/signup/isPhoneUnique')
      .send({
        phoneNumber: '8987776767'
      })
      .expect(409)
      .end(done);
  });

  after(function (done) {
    // Remove all Users from the Database
    db
      .table('users')
      .delete()
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });

});
