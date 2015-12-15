'use strict';

var db = require('../../lib/db');
var expect = require('chai').expect;

// DELETE THIS WHEN CODY GETS THE createData function done
var dbTruncate = require('../../dbTruncate.js');

describe('JobSites Model', function () {

  // DELETE THIS WHEN CODY GETS THE createData function done
  dbTruncate();

  var jobSite1 = {
    generalContractor: 'Test Construction Company',
    id: '1',
    members: [
      {
        id: '1',
        name: 'Cody Daig',
        admin: false
      },
      {
        id: '2',
        name: 'Mark Weber'
      },
      {
        id: '3',
        admin: true,
        name: 'Trevor Hanus'
      }
    ]
  };


  before(function (done) {
    db
      .table('jobSites')
      .insert(jobSite1)
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });

  describe('#isAdmin', function () {

    it('should return false when a user is not an admin', function (done) {
      db.jobSites.isAdmin('1', '1')
        .then(function (isAdmin) {
          expect(isAdmin).to.equal(false);
          done();
        })
        .catch(done);
    });

    it('should return true when a user is an admin', function (done) {
      db.jobSites.isAdmin('3', '1')
        .then(function (isAdmin) {
          expect(isAdmin).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('should return false when a user is not an admin', function (done) {
      db.jobSites.isAdmin('2', '1')
        .then(function (isAdmin) {
          expect(isAdmin).to.equal(false);
          done();
        })
        .catch(done);
    });

  });

  after(function (done) {
    db
      .table('jobSites')
      .delete()
      .run()
      .then(function () {
        done();
      })
      .catch(done);
  });
});
