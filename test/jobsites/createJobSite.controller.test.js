'use strict';

var app = require('../../lib/express');
var db = require('../../lib/db');
var expect = require('chai').expect;
var request = require('supertest');

describe('Create Job Sites Controller Tests `POST - /api/jobsites`', function () {

  var homerToken, jobSite1, homer, jobSite2;

  before(function (done) {
    // Create user Homer for testing
    var user = {
      phoneNumber: '5555555555',
      firstName: 'Homer',
      lastName: 'Simpson',
      email: 'homer@simpson.com',
      password: 'derp1234'
    };

    request(app)
      .post('/api/signup/signup')
      .send(user)
      .end(function (err, res) {
        homer = res.body.user;
        homerToken = res.body.token;
        done();
      });
  });

  it('should respond with 400 if no job site name is sent', function (done) {
    request(app)
      .post('/api/jobsites')
      .set('x-access-token', homerToken)
      .send({})
      .expect(400)
      .end(done);
  });

  it('should respond with 400 if empty job site name is sent', function (done) {
    request(app)
      .post('/api/jobsites')
      .set('x-access-token', homerToken)
      .send({
        name: ''
      })
      .expect(400)
      .end(done);
  });

  it('should not be able to create a job site if user does not have a valid token', function (done) {
    request(app)
      .post('/api/jobsites')
      .send({
        name: 'JobSite1'
      })
      .expect(401)
      .end(done);
  });

  it('should be able to create a job site if user has a valid token', function (done) {
    request(app)
      .post('/api/jobsites')
      .set('x-access-token', homerToken)
      .send({
        name: 'JobSite1'
      })
      .expect(201)
      .end(function (err, res) {
        jobSite1 = res.body;
        expect(jobSite1.name).to.equal('JobSite1');
        done();
      });
  });

  it('should create a job site with the creator as an admin', function (done) {
    db
      .table('jobSites')
      .get(jobSite1.id)
      .run()
      .then(function (jobSite) {
        expect(jobSite.members.length).to.equal(1);
        expect(jobSite.members[0].admin).to.equal(true);
        done();
      });
  });

  it('should return the job site with members', function (done) {
    request(app)
      .post('/api/jobsites')
      .set('x-access-token', homerToken)
      .send({
        name: 'JobSite2'
      })
      .expect(201)
      .end(function (err, res) {
        jobSite2 = res.body;
        expect(jobSite2.members.length).to.equal(1);
        expect(jobSite2.members[0].id).to.equal(homer.id);
        done();
      });
  });

  it('should not have any pending members', function (done) {
    expect(jobSite2.pending.length).to.equal(0);
    done();
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
