'use strict';

var fs = require('promisefs');
var glob = require('glob');
var path = require('path');

var controllers = {};

var re = new RegExp("/^(.*[\\\/])/");

fs.readdirSync(path.resolve('./app/controllers'))
  .filter(function (file) {
    return fs.statSync(path.join(path.resolve('./app/controllers'), file)).isDirectory();
  }).forEach(function (dir) {
    controllers[dir] = {};
  });

for (var controller in controllers) {
  var files = glob.sync('app/controllers/' + controller + '/**/*.js');
  files.forEach(function (file) {
    controllers[controller][file.substring(file.lastIndexOf('/') + 1, file.length-3)] = require(path.resolve(file));
  });
}

module.exports = controllers;
