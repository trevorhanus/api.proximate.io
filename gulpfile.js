'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

var db = require('./lib/db');
var dbSetUp = require('./dbSetUp');
var dbTruncate = require('./dbTruncate');


gulp.task('default', function() {
  console.log('Just start the server by running `node index.js`');
});

gulp.task('test', ['dbTruncate', 'mocha']);

gulp.task('dbTruncate', function (cb) {
  dbTruncate()
    .then(function () {
      cb();
    })
    .catch(cb);
});

gulp.task('mocha', ['dbTruncate'], function () {
  process.env.NODE_ENV = 'test';
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function (err) {
      console.error(err);
      process.exit(1);
    })
    .on('end', function () {
      process.exit(0);
    });
});

gulp.task('dbInit', ['dbTearDown', 'dbSetUp']);

gulp.task('dbTearDown', function (cb) {
  db
    .tableList()
    .run()
    .then(function (tables) {
      var actions = [];
      for(var i=0; i<tables.length; i++) {
        actions.push(db.tableDrop(tables[i]).run());
      }
      return Promise.all(actions);
    })
    .then(function () {
      cb();
    })
    .catch(cb);
});

gulp.task('dbSetUp', ['dbTearDown'], function () {
  dbSetUp()
    .then(function () {
      process.exit(0);
    })
    .catch(function (err) {
      process.exit(1);
    });
});

gulp.task('exit', [], function (err) {
  if (err) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
