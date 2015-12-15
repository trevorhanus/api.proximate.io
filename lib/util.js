'use strict';

var glob = require('glob');

exports.glob = function (globPath, options) {
  return new Promise(function (resolve, reject) {
    glob(globPath, options, function (err, result) {
      if(err) {
        reject(err);
      } else {
        resolve (result);
      }
    });
  });
};
