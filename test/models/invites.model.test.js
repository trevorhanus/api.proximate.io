'use strict';

var db = require('../../lib/db');
var expect = require('chai').expect;
var should = require('chai').should();

// DELETE THIS WHEN CODY GETS THE createData function done
var dbTruncate = require('../../dbTruncate.js');

describe('Invites Model', function () {

  // DELETE THIS WHEN CODY GETS THE createData function done
  dbTruncate();

  var invitePhone = {
    phoneNumber: '1234567890',
    jobSiteId: '1'
  };

  var inviteUserId = {
    userId: '2ajf2fj-asdfjjf2-f2flj2fjf',
    jobSiteId: '1'
  };

  before(function (done) {
    db
      .table('invites')
      .insert(inviteUserId)
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });

  it('should be able to create an invite', function (done) {
    db.invites.createInvite(invitePhone)
      .then(function (invite) {
        expect(invite.phoneNumber).to.equal('1234567890');
        db
          .table('invites')
          .then(function (invites) {
            expect(invites.length).to.be.equal(2);
            done();
          })
          .catch(done);
      })
      .catch(done);
  });

  it('should have 2 invites', function (done) {
    db
      .table('invites')
      .then(function (invites) {
        expect(invites.length).to.be.equal(2);
        done();
      })
      .catch(done);
  });

  it('isInvited - should return a phoneNumber invite when it exists', function (done) {
    db.invites.isInvited(invitePhone.phoneNumber, invitePhone.jobSiteId)
      .then(function (invite) {
        should.exist(invite);
        done();
      })
      .catch(done);
  });

  it('isInvited - should return a userId invite when it exists', function (done) {
    db.invites.isInvited(inviteUserId.userId, inviteUserId.jobSiteId)
      .then(function (invite) {
        should.exist(invite);
        done();
      })
      .catch(done);
  });

  after(function (done) {
    db
      .table('invites')
      .delete()
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });
});
