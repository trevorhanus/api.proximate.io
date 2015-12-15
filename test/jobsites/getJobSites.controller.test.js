'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');
var utils = require('../../lib/testUtils.js');

describe('Get Job Sites Controller Tests `GET - /api/jobsites`', function () {

  var user1, user2, user1JobSite1, user1JobSite2, user2JobSite1, user1JobSites, user2JobSites;

  before(function (done) {
    utils.createMockUser()
      .then(function (newUser1) {
        user1 = newUser1;

        return utils.createMockUser()
          .then(function (newUser2) {
            user2 = newUser2;
          });
      })
      .then(function () {
        return utils.createMockJobSite(user1)
          .then(function (jobSite) {
            user1JobSite1 = jobSite;
          });
      })
      .then(function () {
        return utils.createMockJobSite(user1)
          .then(function (jobSite) {
            user1JobSite2 = jobSite;
          });
      })
      .then(function () {
        return utils.createMockJobSite(user2)
          .then(function (jobSite) {
            user2JobSite1 = jobSite;
          });
      })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should return all job sites on bridge', function (done) {
    request(app)
      .get('/api/jobsites')
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body).to.have.length.of(3);
          done();
        }
      });
  });

  it('should return all job sites on bridge expect user\'s job sites when filterMineOut=true', function (done) {
    request(app)
      .get('/api/jobsites?filterMineOut=true')
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.length).to.equal(1);
          done();
        }
      });
  });

  it('should return job sites with user\'s status when filterMineOut=true', function (done) {
    // user1 requests access to user2JobSite1
    request(app)
      .post('/api/jobsites/' + user2JobSite1.id + '/request')
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          request(app)
            .get('/api/jobsites?filterMineOut=true')
            .set('x-access-token', user1.token)
            .end(function (err, res) {
              if(err) {
                done(err);
              } else {
                var requestedJobSite;
                res.body.forEach(function (jobSite) {
                  if (jobSite.id === user2JobSite1.id) {
                    requestedJobSite = jobSite;
                  }
                });
                expect(requestedJobSite.status).to.equal('pending request');
                done();
              }
            });
        }
      });
  });

  // Skipping this one for now, we can revisit it later
  xit('should not return the list of members and pending users', function (done) {
    request(app)
      .get('/api/jobsites')
      .set('x-access-token', user1.token)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          expect(res.body[0].members).to.equal(undefined);
          expect(res.body[0].pending).to.equal(undefined);
          done();
        }
      });
  });

  xit('should return job sites with user\'s status - invited', function (done) {
    // TODO: finish this when invite has been tested
    // Invite user2 to user1JobSite1
    // the request should return 2 job sites
    // user1JobSite1.status should equal 'invited'
    // user1JobSite2.status should be undefined
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
