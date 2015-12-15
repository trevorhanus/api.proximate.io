'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');
var utils = require('../../lib/testUtils.js');

describe('Grant Access Controller Tests `/api/jobsites/:jobSiteId/grant/:rawUserId`', function () {

  var user1, user2, user3, user1JobSite1, user2JobSite1;

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
        return utils.createMockUser()
          .then(function (newUser3) {
            user3 = newUser3;
          });
      })
      .then(function () {
        return utils.createMockJobSite(user1)
          .then(function (jobSite) {
            user1JobSite1 = jobSite;
          });
      })
      .then(function () {
        return utils.createMockJobSite(user2)
          .then(function (jobSite) {
            user2JobSite1 = jobSite;
          });
      })
      .then(function () {
        // User2 requests access to user1JobSite1
        request(app)
          .post('/api/jobsites/' + user1JobSite1.id + '/request')
          .set('x-access-token', user2.token)
          .end(function (err, res) {
            if (err) {
              done(err);
            } else {
              done();
            }
          });
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should return 401 when request is made without a valid token', function (done) {
    request(app)
      .post('/api/jobsites/' + user1JobSite1.id + '/grant/' + user2.id)
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should successfully granting access to a user - return 200', function (done) {
    // User1 grants access to User2 at user1JobSite1
    request(app)
      .post('/api/jobsites/' + user1JobSite1.id + '/grant/' + user2.id)
      .set('x-access-token', user1.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should add the job site to the user who was granted access', function (done) {
    db
      .table('users')
      .get(user2.id)
      .run()
      .then(function (user) {
        expect(user.jobSites.length).to.equal(2);
        expect(user.jobSites[1].id).to.equal(user1JobSite1.id);
        done();
      })
      .catch(done);
  });

  it('should remove the user from the job site\'s pending array', function (done) {
    db
      .table('jobSites')
      .get(user1JobSite1.id)
      .run()
      .then(function (jobSite) {
        expect(jobSite.pending.length).to.equal(0);
        done();
      })
      .catch(done);
  });

  it('should add the user to the job site members array on successfully granting access', function (done) {
    db
      .table('jobSites')
      .get(user1JobSite1.id)
      .run()
      .then(function (jobSite) {
        var found = false;
        jobSite.members.forEach(function (member) {
          if (member.id === user2.id) {
            found = true;
          }
        });
        expect(found).to.equal(true);
        done();
      })
      .catch(done);
  });

  it('should not allow admin to grant access to the same user after they have been granted access. return - 400', function (done) {
    // User1 grants access to User2 at user1JobSite1
    request(app)
      .post('/api/jobsites/' + user1JobSite1.id + '/grant/' + user2.id)
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

  it('should not allow a non-admin to grant access - return 403', function (done) {
    // User3 requests access to user1JobSite1
    request(app)
      .post('/api/jobsites/' + user1JobSite1.id + '/request')
      .set('x-access-token', user3.token)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // User2 (non-admin) trys to grant access to user3 at user1JobSite1
          request(app)
            .post('/api/jobsites/' + user1JobSite1.id + '/grant/' + user3.id)
            .set('x-access-token', user2.token)
            .expect(403)
            .end(function (err, res) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
        }
      });
  });

  it('should not allow admin to grant access to a user who has not requested or invited - return 400', function (done) {
    // User2 trys to grant access to user3 at User2JobSite1
    request(app)
      .post('/api/jobsites/' + user2JobSite1.id + '/grant/' + user3.id)
      .set('x-access-token', user2.token)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.error).to.equal('User has not requested access to that job site');
          done();
        }
      });
  });


  xit('should return 201 on successfully granting access to a user that was invited by another user', function (done) {
    // TODO: finish this test when the invites have been tested
  });

  xit('should make a user a member when they request access to a job site they have been invited to', function (done) {
    // TODO: finish this test when the invites have been tested
  });

  after(function (done) {
    // Remove all Users from the Database
    utils.dropTable('users')
      .then(function () {
        return utils.dropTable('jobSites');
      })
      .then(function () {
        return utils.dropTable('invites');
      })
      .then(function () {
        done();
      })
      .catch(done);
  });
});
