'use strict';

var db = require('../../lib/db');
var expect = require('chai').expect;
var util = require('../../lib/testUtils.js');

describe('Test Utilities', function () {

  it('should delete all the rows from a table', function (done) {
    // this.timeout(5000);
    db
      .table('users')
      .insert({
        displayName: 'testing the drop'
      })
      .run()
      .then(function () {
        return db
          .table('users')
          .run();
      })
      .then(function (users) {
        return expect(users).to.have.length.of.at.least(1);
      })
      .then(function () {
        return util.dropTable('users');
      })
      .then(function () {
        return db
          .table('users')
          .run();
      })
      .then(function (users) {
        expect(users).to.have.length.of(0);
        return done();
      })
      .catch(done);
  });

  it('should create a mock user', function (done) {
    var user;
    util.createMockUser()
      .then(function (_user) {
        user = _user;
        return db
          .table('users')
          .run();
      })
      .then(function (users) {
        var _user = users[0];
        expect(users).to.have.length.of(1);
        expect(_user.id).to.equal(user.id);
        done();
      })
      .catch(done);
  });
  
  after(function (done) {
    util.dropTable('users')
      .then(function () {
        done();
      });
  });

});
