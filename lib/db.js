'use strict';

var rethinkdb = require('rethinkdbdash');

var db = rethinkdb({
  db: 'bridge',
  //pool: false,
  //servers: [{host:'10.134.149.30'}, {host:'10.134.128.163'}]
  //servers: [{host: 'db1.sfo1.bridgechat.io'}, {host: 'db1.nyc3.bridgechat.io'}]
  servers: [{host: process.env.DB1_HOST}, {host: process.env.DB2_HOST}]
});

require('../app/models/jobsites.models.js')(db);
require('../app/models/invites.models.js')(db);
require('../app/models/messages.models.js')(db);
require('../app/models/users.models.js')(db);

db.validateSchema = function (schema, obj) {
  var result = {};
  for(var key in schema) { 
    
    // Check if the field is required
    if(schema[key].required && obj[key] === undefined) {
      throw new Error('Expected ' + key + ' to be defined but found undefined!');
    }
    
    // Check if the field must be a certain type
    if(schema[key].type) {
      
      // Check if the field must be a string
      if(schema[key].type === 'string' && typeof obj[key] !== 'string') {
        throw new Error('Expected ' + key + ' to be a string.');
      }
      
      // Check if the field must be an Array
      if(schema[key].type === 'array' && !Array.isArray(obj[key])) {
        throw new Error('Expected ' + key + ' to be an array.');
      }
      
      // Check if the field must be a Boolean
      if(schema[key].type === 'boolean' && typeof obj[key] !== 'boolean') {
        throw new Error('Expected ' + key + ' to be a boolean.');
      }
      
      // Check if the field must be an Array
      if(schema[key].type === 'object' && !Array.isArray(obj[key]) && typeof obj[key] !== 'object') {
        throw new Error('Expected ' + key + ' to be an array.');
      }
      
    }
    
    // If nullable is false && the value is null, throw an error
    if(schema[key].nullable === false && obj[key] === null) {
      throw new Error('Expected ' + key + ' to not be null!');
    }
    
    // If nullable is true && the value is undefined, set value to null
    if(schema[key].nullable === true && obj[key] === undefined) {
      obj[key] = null;
    }
    
    result[key] = obj[key];
  }
  return result;
};

module.exports = db;
