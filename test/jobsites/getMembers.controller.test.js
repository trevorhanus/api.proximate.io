'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');
var utils = require('../../lib/testUtils.js');
var twilio = require('../../lib/twilio');
var sinon = require('sinon');

// DELETE THIS WHEN CODY GETS THE createData function done
var dbTruncate = require('../../dbTruncate.js');

describe('Get Members Controller Tests `/api/jobsites/:jobSiteId/members`', function () {

  // DELETE THIS WHEN CODY GETS THE createData function done
  dbTruncate();

  var admin, member1, member2, member3, member4, member5, nonMember1, nonMember2, jobSite1;
  var randomPhone1 = '1234567890';
  var twilioMock;

  beforeEach(function () {
    twilioMock = sinon.stub(twilio, 'sendSMS', function () {
      return new Promise(function (resolve, reject) {
        resolve();
      });
    });
  });

  before(function (done) {
    this.timeout(5000); // This was taking too long on my computer and timing out

    utils.createMockUser()
      .then(function (newUser) {
        admin = newUser;

        return utils.createMockUser()
          .then(function (newUser1) {
            member1 = newUser1;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser2) {
            member2 = newUser2;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser3) {
            member3 = newUser3;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser4) {
            member4 = newUser4;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser5) {
            member5 = newUser5;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser6) {
            nonMember1 = newUser6;
          });
      })
      .then(function () {
        return utils.createMockJobSite(admin)
          .then(function (jobSite) {
            jobSite1 = jobSite;
          });
      })
      .then(function () {
        // member1 requests access to jobSite1
        return new Promise(function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/request')
            .set('x-access-token', member1.token)
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // admin grants access to member1 to jobSite1
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/grant/' + member1.id)
            .set('x-access-token', admin.token)
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // member2 requests access to jobSite1
        return new Promise(function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/request')
            .set('x-access-token', member2.token)
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // admin grants access to member2 to jobSite1
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/grant/' + member2.id)
            .set('x-access-token', admin.token)
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // member3 requests access to jobSite1
        return new Promise(function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/request')
            .set('x-access-token', member3.token)
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // member2 invites nonMember1 by id
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/invite')
            .set('x-access-token', member2.token)
            .send({
              userId: nonMember1.id
            })
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // member1 invites randomPhone1
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/invite')
            .set('x-access-token', member1.token)
            .send({
              phoneNumber: randomPhone1
            })
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  afterEach(function () {
    twilio.sendSMS.restore();
  });

  it('should return 401 when request is made without a valid token', function (done) {
    // Shouldn't add anything to the invites table
    request(app)
      .get('/api/jobsites/' + jobSite1.id + '/members')
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should return 200 with members, pending, and invited for admin', function (done) {
    request(app)
      .get('/api/jobsites/' + jobSite1.id + '/members')
      .set('x-access-token', admin.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // members: admin, member1, member2
          // pending: member3
          // invited:  nonMember1, randomPhone
          expect(res.body.members.length).to.equal(3);
          expect(res.body.invited.length).to.equal(2);
          expect(res.body.pending.length).to.equal(1);
          done();
        }
      });
  });

  it('should return 200 with members and invited for member2', function (done) {
    request(app)
      .get('/api/jobsites/' + jobSite1.id + '/members')
      .set('x-access-token', member2.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // members: admin, member1, member2
          // pending: member3
          // invited:  nonMember1, randomPhone
          expect(res.body.members.length).to.equal(3);
          expect(res.body.invited.length).to.equal(1);
          expect(res.body.pending).to.equal(undefined);
          expect(res.body.invited[0].userId).to.equal(nonMember1.id);
          done();
        }
      });
  });

  it('should return 200 with members and invited for member1', function (done) {
    request(app)
      .get('/api/jobsites/' + jobSite1.id + '/members')
      .set('x-access-token', member1.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          // members: admin, member1, member2
          // pending: member3
          // invited:  nonMember1, randomPhone
          expect(res.body.members.length).to.equal(3);
          expect(res.body.invited.length).to.equal(1);
          expect(res.body.pending).to.equal(undefined);
          expect(res.body.invited[0].phoneNumber).to.equal(randomPhone1);
          done();
        }
      });
  });

  it('should return 401 for non-members', function (done) {
    request(app)
      .get('/api/jobsites/' + jobSite1.id + '/members')
      .set('x-access-token', nonMember1.token)
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.text).to.equal('You are not a member');
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
        // Remove all Job Sites from the Database
        return db
          .table('invites')
          .delete()
          .run();
      })
      .then(function () {
        done();
      })
      .catch(done);
  });
});
