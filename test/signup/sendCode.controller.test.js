'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');
var twilio = require('../../lib/twilio');
var sinon = require('sinon');

describe('Send Code Controller `/api/signup/sendcode`', function () {

  var rowCode, twilioMock;

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

  beforeEach(function () {
    twilioMock = sinon.stub(twilio, 'sendSMS', function () {
      return new Promise(function (resolve, reject) {
        resolve();
      });
    });
  });

  afterEach(function () {
    twilio.sendSMS.restore();
  });

  it('should respond with status 400 if no phoneNumber specified', function (done) {
    request(app)
      .post('/api/signup/sendcode')
      .send({})
      .expect(400)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body.error).to.equal('No phoneNumber Specified.');
          done();
        }
      });
  });

  it('should respond with 409 if duplicate phoneNumber', function (done) {
    request(app)
      .post('/api/signup/sendcode')
      .send({
        phoneNumber: '8987776767'
      })
      .expect(409)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body.error).to.equal('Phone Number already registered.');
          done();
        }
      });
  });

  it('should respond with status code 200', function (done) {
    request(app)
      .post('/api/signup/sendcode')
      .send({
        phoneNumber: '4157130893'
      })
      .expect(200)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body.message).to.eql('Success');
          done();
        }
      });
  });

  it('should add the code to the database', function (done) {
    request(app)
      .post('/api/signup/sendcode')
      .send({
        phoneNumber: '1234567890'
      })
      .expect(200)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          db
            .table('phoneNumberCodes')
            .getAll('1234567890', {index: 'phoneNumber'})
            .run()
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              rowCode = rows[0];
              done();
            })
            .catch(done);
        }
      });
  });

  it('should overwrite the code in the database', function (done) {
    db
      .table('phoneNumberCodes')
      .get(rowCode.id)
      .update({code: 'aaaa'})
      .run()
      .then(function () {
        request(app)
          .post('/api/signup/sendcode')
          .send({
            phoneNumber: '1234567890'
          })
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err);
            } else {
              db
                .table('phoneNumberCodes')
                .getAll('1234567890', {index: 'phoneNumber'})
                .run()
                .then(function (rows) {
                  expect(rows[0].code).to.not.equal(rowCode.code);
                  done();
                })
                .catch(done);
            }
          });
        });
  });

  it('should send a text message', function (done) {
    request(app)
      .post('/api/signup/sendcode')
      .send({
        phoneNumber: '4157130893'
      })
      .expect(200)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(twilioMock.calledOnce).to.equal(true);
          done();
        }
      });
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
