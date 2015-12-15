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

describe('Approve Controller Tests `/api/jobsites/:jobSiteId/approve`', function () {

  // DELETE THIS WHEN CODY GETS THE createData function done
  dbTruncate();

  var twilioMock;
  var admin, member, nonMember1, nonMember2, jobSite1;

  var randomPhone1 = '5521431253';
  var randomPhone2 = '5551234123';

  beforeEach(function () {
    twilioMock = sinon.stub(twilio, 'sendSMS', function () {
      return new Promise(function (resolve, reject) {
        resolve();
      });
    });
  });

  before(function (done) {
    this.timeout(3000); // This was taking too long on my computer and timing out

    utils.createMockUser()
      .then(function (newUser1) {
        admin = newUser1;

        return utils.createMockUser()
          .then(function (newUser2) {
            member = newUser2;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser3) {
            nonMember1 = newUser3;
          });
      })
      .then(function () {
        return utils.createMockUser()
          .then(function (newUser4) {
            nonMember2 = newUser4;
          });
      })
      .then(function () {
        return utils.createMockJobSite(admin)
          .then(function (jobSite) {
            jobSite1 = jobSite;
          });
      })
      .then(function () {
        // member requests access to jobSite1
        return new Promise(function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/request')
            .set('x-access-token', member.token)
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
        // admin grants access to member to jobSite1
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/grant/' + member.id)
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
        // member invites nonMember1
        return new Promise (function (resolve, reject) {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/invite')
            .set('x-access-token', member.token)
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
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .send({
        userId: nonMember1.id
      })
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return 403 when request is made by a non-admin', function (done) {
    // member makes request
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', member.token)
      .send({
        userId: nonMember1.id
      })
      .expect(403)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return 400 when request is made with a userId that hasn\'t been invited', function (done) {
    // member makes request
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .send({
        userId: nonMember2.id
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return 400 when request is made with a phoneNumber that hasn\'t been invited', function (done) {
    // member makes request
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .send({
        phoneNumber: randomPhone2
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return 400 when request is made without a phoneNumber or userId', function (done) {
    // member makes request
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should approve userId that has been invited by member', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .send({
        userId: nonMember1.id
      })
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (invites) {
              expect(res.text).to.equal('Approved');
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(true);
              // TODO: test that it sent a notification to the members who invited this person
              // TODO: test that it sent a notification to the userId that was invited
              // TODO: test that it sent a notification to the other admins
              done();
            })
            .catch(done);
        }
      });
  });

  it('should approve phone number that has been invited by member', function (done) {
    // member invites randomPhone1
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', member.token)
      .send({
        phoneNumber: randomPhone1
      })
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          request(app)
            .post('/api/jobsites/' + jobSite1.id + '/approve')
            .set('x-access-token', admin.token)
            .send({
              phoneNumber: randomPhone1
            })
            .expect(200)
            .end(function (err, res) {
              if (err) {
                done(err);
              } else {
                db
                  .table('invites')
                  .getAll(randomPhone1, {index: 'phoneNumber'})
                  .then(function (invites) {
                    expect(res.text).to.equal('Approved');
                    expect(invites.length).to.equal(1);
                    expect(invites[0].invitedByAdmin).to.equal(true);
                    // TODO: test that it sent a notification to the members who invited this person
                    // TODO: test that it sent a notification to the userId that was invited
                    // TODO: test that it sent a notification to the other admins
                    done();
                  })
                  .catch(done);
              }
            });
        }
      });
  });

  it('should return 400 when userId was already approved by admin', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .send({
        userId: nonMember1.id
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .getAll(nonMember1.id, {index: 'userId'})
            .then(function (invites) {
              expect(res.text).to.equal('Invite was already approved');
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(true);
              // TODO: test that it sent a notification to the members who invited this person
              // TODO: test that it sent a notification to the userId that was invited
              // TODO: test that it sent a notification to the other admins
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return 400 when phone number was already approved by admin', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/approve')
      .set('x-access-token', admin.token)
      .send({
        phoneNumber: randomPhone1
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .getAll(randomPhone1, {index: 'phoneNumber'})
            .then(function (invites) {
              expect(res.text).to.equal('Invite was already approved');
              expect(invites.length).to.equal(1);
              expect(invites[0].invitedByAdmin).to.equal(true);
              // TODO: test that it sent a notification to the members who invited this person
              // TODO: test that it sent a notification to the userId that was invited
              // TODO: test that it sent a notification to the other admins
              done();
            })
            .catch(done);
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
