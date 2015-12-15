'use strict';

/*
 * Module Dependencies
 */
var app = require('./lib/express');
var http = require('http');
var socketio = require('./lib/io');

// Initialize the HTTP server
var server = http.createServer(app);

// Start the socket.io Server
socketio.startIO(server);

// Start the Server
server.listen(3434, function (err) {
  if(err) {
    console.error(err);
  } else {
    console.log('Party is hoping on port 3434');
  }
});
