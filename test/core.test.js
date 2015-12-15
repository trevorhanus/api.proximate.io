'use strict';

var app = require('../lib/express');
var db = require('../lib/db');
var expect = require('chai').expect;
var request = require('supertest');

describe('Basic Truth Test', function () {
  
  it('should pass a basic truth test', function () {
    expect(true).to.equal(true);
  });

  it('should respond to `/` with a 200 status code', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .end(done);
  });

});
