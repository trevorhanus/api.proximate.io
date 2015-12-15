'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');
var util = require('../../lib/testUtils');

describe('Create Group Controller Tests', function () {

  var jobSite, user;

  beforeEach(function (done) {
    util.dropTable('groups')
      .then(function () {
        return util.dropTable('users');
      })
      .then(function () {
        return util.createMockUser();
      })
      .then(function (_user) {
        user = _user;
        return util.createMockJobSite(user);
      })
      .then(function (_jobSite) {
        jobSite = _jobSite;
        done();
      })
      .catch(done);
  });

  it('should return 401 when request is made without a valid token', function (done) {
    request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group 1',
        type: 'public',
        jobSiteId: jobSite.id
      })
      .expect(401)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should return 403 when a user is not a part of a jobsite', function (done) {
    var user2;

    util.createMockUser()
      .then(function (_user) {
        user2 = _user;
        return util.createMockJobSite(user2);
      })
      .then(function (_jobsite) {
        request(app)
          .post('/api/groups')
          .set('x-access-token', user2.token)
          .send({
            name: 'Test Group 1',
            type: 'public',
            jobSiteId: jobSite.id
          })
          .expect(403)
          .end(function (err, res) {
            if(err) {
              done(err);
            } else {
              done();
            }
          });
      });
  });

  it('should return status code of 201 on creation of group', function (done) {
    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send({
        name: 'Test Group 1',
        type: 'public',
        jobSiteId: jobSite.id
      })
      .expect(201)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('should add the newly created group to the database', function (done) {
    var group = {
      name: 'Test Group 1',
      type: 'public',
      jobSiteId: jobSite.id
    };

    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send(group)
      .expect(201)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          db
            .table('groups')
            .run()
            .then(function (groups) {
              expect(groups).to.have.length.of(1);
              expect(groups[0].name).to.equal(group.name);
              expect(groups[0].type).to.equal(group.type);
              expect(groups[0].jobSiteId).to.equal(group.jobSiteId);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should return the newly created group', function (done) {
    var _group = {
      name: 'Test Group 2',
      type: 'public',
      jobSiteId: jobSite.id
    };

    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send(_group)
      .expect(201)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          var group = res.body;
          expect(group.id).to.be.a('string');
          expect(group.name).to.equal(_group.name);
          expect(group.type).to.equal(_group.type);
          expect(group.jobSiteId).to.equal(_group.jobSiteId);
          done();
        }
      });
  });

  it('should only allow the types public, private, and directMessage', function (done) {
    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send({
        name: 'Test Group 1',
        type: 'fdjsiaofdflhei',
        jobSiteId: jobSite.id
      })
      .expect(400)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          db
            .table('groups')
            .run()
            .then(function (groups) {
              expect(groups).to.have.length.of(0);
              done();
            })
            .catch(done);
        }
      });
  });

  it('should add the current user a member of the group', function (done) {
    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send({
        name: 'Test Group 2',
        type: 'public',
        jobSiteId: jobSite.id
      })
      .expect(201)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          var group = res.body;
          expect(group.members).to.have.length.of(1);
          expect(group.members[0].id).to.equal(user.id);
          expect(group.members[0].name).to.equal(user.displayName);
          done();
        }
      });
  });

  it('should add the group to the user upon creation', function (done) {
    request(app)
      .post('/api/groups')
      .set('x-access-token', user.token)
      .send({
        name: 'Test Group 2',
        type: 'public',
        jobSiteId: jobSite.id
      })
      .expect(201)
      .end(function (err, res) {
        if(err) {
          done(err);
        } else {
          var group = res.body;
          db
            .table('users')
            .get(user.id)
            .run()
            .then(function (_user) {
              expect(_user.groups).to.have.length.of(1);
            });
          done();
        }
      });
  });

  after(function (done) {
    util.dropTable('groups')
      .then(function () {
        return util.dropTable('users');
      })
      .then(function () {
        return util.dropTable('jobSites');
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

});
