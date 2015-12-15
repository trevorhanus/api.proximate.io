'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');

describe('Request Access Controller Tests `/api/jobsites/:jobSiteId/request`', function () {

  var user1, user2;

  before(function (done) {
    // Create user1
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
      .then(function (err, res) {
        return createJobSite(user2, 'user2JobSite1');
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

  it('should return 401 when request is made without a valid token', function (done) {
    var jobSiteId = user1.jobSites[0].id;
    request(app)
      .post('/api/jobsites/' + jobSiteId + '/request')
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should allow a user to request access to a job site', function (done) {
    // User1 is requesting access to user2 - job site 1
    var jobSiteId = user2.jobSites[0].id;
    request(app)
      .post('/api/jobsites/' + jobSiteId + '/request')
      .set('x-access-token', user1.token)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // get the job site from the database
          db
            .table('jobSites')
            .get(jobSiteId)
            .run()
            .then(function (jobSite) {
              expect(jobSite.pending.length).to.equal(1);
              expect(jobSite.pending[0].id).to.equal(user1.user.id);
              done();
            });
        }
      });
  });

  it('should return `400 - request pending` when a user who requests access to a job site they have already requested access to', function (done) {
    var jobSiteId = user2.jobSites[0].id;
    request(app)
      .post('/api/jobsites/' + jobSiteId + '/request')
      .set('x-access-token', user1.token)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should not add the user to pending when a user who requests access to a job site they have already requested access to', function (done) {
    var jobSiteId = user2.jobSites[0].id;
    request(app)
      .post('/api/jobsites/' + jobSiteId + '/request')
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // get the job site from the database
          db
            .table('jobSites')
            .get(jobSiteId)
            .run()
            .then(function (jobSite) {
              expect(jobSite.pending.length).to.equal(1);
              expect(jobSite.pending[0].id).to.equal(user1.user.id);
              done();
            });
        }
      });
  });

  it('should return `400 - already a member` when a user to requests access to a job site they are already a member of', function (done) {
    var jobSiteId = user1.jobSites[0].id;
    request(app)
      .post('/api/jobsites/' + jobSiteId + '/request')
      .set('x-access-token', user1.token)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // get the job site from the database
          db
            .table('jobSites')
            .get(jobSiteId)
            .run()
            .then(function (jobSite) {
              expect(jobSite.pending.length).to.equal(0);
              done();
            })
            .catch(done);
        }
      });
  });

  xit('should make a user a member when they request access to a job site they have been invited to', function (done) {

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
