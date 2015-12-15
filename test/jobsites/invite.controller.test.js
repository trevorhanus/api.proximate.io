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

describe('Invite Controller Tests `/api/jobsites/:jobSiteId/invite`', function () {

  // DELETE THIS WHEN CODY GETS THE createData function done
  dbTruncate();

  var twilioMock;
  var admin, member, nonMember1, nonMember2, jobSite1;

  var randomPhone1 = '5521431253';
  var randomPhone2 = '5551234123';

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
        // User 1 grants access to member to jobSite1
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
        done();
      })
      .catch(function (err) {
        done(err);
      });
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

  it('should return 401 when request is made without a valid token', function (done) {
    // Shouldn't add anything to the invites table
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .send({
        phoneNumber: nonMember1.phoneNumber
      })
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(0);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  // Non-members at job site
  it('should not allow a non-member to send an invite to a bridge member', function (done) {
    // nonMember1 (non-member) sends an invite to nonMember2
    // Should not send randomNumber a text
    // Should not add randomNumber to invites table
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', nonMember1.token)
      .send({
        userId: nonMember2.id
      })
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(0);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should not allow a non-member to send an invite to a phone number', function (done) {
    // nonMember1 (non-member) sends an invite to randomNumber1
    // Should not send randomNumber a text
    // Should not add randomNumber to invites table
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', nonMember1.token)
      .send({
        phoneNumber: randomPhone1
      })
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(0);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  // For Invites to users on Bridge

  // Members at a job site
  it('should allow a member to invite a user who is on bridge but not already a job site member', function (done) {
    // member sends an invite to nonMember1
    // Should send admin a notification *********Can not test this until notifications is implemented
    // Should add nonMember1 to invites table with correct job site
    // Should not send nonMember1 a text message, because the admin has not approved the invite
    // invitedByAdmin should be false
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', member.token)
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
            .getAll(nonMember1.id, {index: 'userId'})
            .then(function (rows) {
              expect(res.text).to.equal('Invite created - Job site admin notified');
              expect(rows.length).to.equal(1);
              expect(rows[0].jobSiteId).to.equal(jobSite1.id);
              expect(rows[0].userId).to.equal(nonMember1.id);
              expect(rows[0].invitedByAdmin).to.equal(false);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should send a notification to the job site admins when a non-member who has already been invited is invited again by a member', function (done) {
    // member sends an invite to nonMember1
    // Shouldn't add a new invite to the invites table
    // should not send nonMember1 a reminder notification *********Can not test this until notifications is implemented
    // Shouldn't send nonMember1 a text message
    // Should send the job site admins another notification
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', member.token)
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
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              expect(rows[0].jobSiteId).to.equal(jobSite1.id);
              expect(twilioMock.called).to.equal(false);
              expect(res.text).to.equal('Invite created - Job site admin notified');
              expect(rows[0].invitedByAdmin).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should not allow a member/admin to invite a user who is on bridge but is already a member', function (done) {
    // admin sends an invite to member
    // Should return 400 - User is already a member
    // Shouldn't add anything to the invites table
    // Shouldn't send a notification *********Can not test this until notifications is implemented
    // Shouldn't send a text message
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', admin.token)
      .send({
        userId: member.id
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should not allow a member to invite their self', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', admin.token)
      .send({
        userId: admin.id
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should not allow a member to invite a userId that is not on bridge', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', member.token)
      .send({
        userId: 'asdfj-asjdwjf-wfhjv-wasj'
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  //Admins at a job site
  it('should allow an admin to invite a user who is on bridge but not already a job site member', function (done) {
    // admin sends an invite to nonMember2
    // Should add nonMember2 to invites table with correct job site
    // Should send nonMember2 a notification ******** NEED TO TEST
    // Should not send admins notifications ********* NEED TO TEST
    // invitedByAdmin should be true
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', admin.token)
      .send({
        userId: nonMember2.id
      })
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .getAll(nonMember2.id, {index: 'userId'})
            .then(function (rows) {
              expect(res.text).to.equal('Invited');
              expect(rows.length).to.equal(1);
              expect(rows[0].jobSiteId).to.equal(jobSite1.id);
              expect(rows[0].userId).to.equal(nonMember2.id);
              expect(rows[0].invitedByAdmin).to.equal(true);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should not allow an admin to invite a userId that is not on bridge', function (done) {
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', admin.token)
      .send({
        userId: 'asdfj-asjdwjf-wfhjv-wasj'
      })
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          db
            .table('invites')
            .then(function (rows) {
              expect(rows.length).to.equal(2);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  // For Invites to users not on bridge

  // Members at a job site
  it('should allow a member to invite a phone number who is not on bridge', function (done) {
    // member sends an invite to randomNumber1
    // Should not send randomNumber1 a text
    // Should add randomNumber1 to invites table with correct job site
    // Should add randomNumber1 to invites table with a name
    // Should not send a text until admin approves
    request(app)
      .post('/api/jobsites/' + jobSite1.id + '/invite')
      .set('x-access-token', member.token)
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
            .then(function (rows) {
              expect(rows.length).to.equal(1);
              expect(rows[0].jobSiteId).to.equal(jobSite1.id);
              // expect(rows[0].name).to.equal(randomName1);
              expect(rows[0].invitedBy[0].id).to.equal(member.id);
              expect(twilioMock.called).to.equal(false);
              done();
            })
            .catch(done);
        }
      });
  });

  xit('should create an invite by userId when an invite is sent to a phone number that is already on Bridge', function (done) {
    // member sends an invite to nonmember2.phoneNumber
    // twilio should not be called
    // invite member should have been called
    // new invite should be created by userId
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
