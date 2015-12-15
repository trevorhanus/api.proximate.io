'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');

describe('Get Job Site Controller Tests `GET - /api/jobsites/:jobSiteId`', function () {

  var user1, user2;

  before(function (done) {
    user1 = {
      phoneNumber: '5555555551',
      firstName: 'First',
      lastName: 'user',
      email: 'firstuser@bridgechat.io',
      password: 'derp1234'
    };

    user2 = {
      phoneNumber: '5555555552',
      firstName: 'Second',
      lastName: 'user',
      email: 'seconduser@bridgechat.io',
      password: 'derp1234'
    };

    createUser(user1)
      .then(function () {
        return createUser(user2);
      })
      .then(function (err, res) {
        return createJobSite(user1, 'user1JobSite1');
      })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });

    function createUser (user) {
      return new Promise(function (resolve, reject) {
        request(app)
          .post('/api/signup/signup')
          .send(user)
          .end(function (err, res) {
            if (err) {
              reject(err);
            } else {
              user.user = res.body.user;
              user.token = res.body.token;
              resolve();
            }
          });
      });
    }

    function createJobSite (user, name) {
      return new Promise (function (resolve, reject) {
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
            user.jobSites = [];
            user.jobSites.push(res.body);
            resolve();
          }
        });
      });
    }
  });

  it('should return 401 without a valid token', function (done) {
    var jobSiteId = user1.jobSites[0].id;
    request(app)
      .get('/api/jobsites/' + jobSiteId)
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should return 404 with an invalid job site id', function (done) {
    request(app)
      .get('/api/jobsites/' + 'asdflkjasdf')
      .set('x-access-token', user1.token)
      .expect(404)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should return the job site', function (done) {
    var jobSiteId = user1.jobSites[0].id;
    request(app)
      .get('/api/jobsites/' + jobSiteId)
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.id).to.equal(user1.jobSites[0].id);
          expect(res.body.name).to.equal(user1.jobSites[0].name);
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
        // Remove all Job Sites from the Database
        return db
          .table('jobSites')
          .delete()
          .run();
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

});
