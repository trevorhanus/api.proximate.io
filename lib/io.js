'use strict';

var db = require('./db');
var fs = require('fs');
var socketio = require('socket.io');
var socketioJwt = require('socketio-jwt');

var io;
var privateKey  = fs.readFileSync('ssl/key.pem', 'utf8');

exports.startIO = function (http) {
  io = socketio(http);

  io.on('connection', function (socket) {
    console.log('A User Connected');
    socket.on('join', function (data) {
      console.log('Welcome ' + socket.decoded_token.firstName + ' to ' + data.groupId);
      socket.join(data.groupId);
    });
    socket.on('leave', function (data) {
      console.log('Adios ' + socket.decoded_token.firstName + ' from ' + data.groupId);
      socket.leave(data.groupId);
    });
  });

  io.on('connection', socketioJwt.authorize({
    secret: privateKey,
    timeout: 60000*60 // 15 seconds to send the authentication message
  }));

  io.on('authenticated', function (socket) {
    //this socket is authenticated, we are good to handle more events from it.
    console.log('hello! ' + socket.decoded_token.firstName);
    socket.on('disconnect', function () {
      console.log('bye! ' + socket.decoded_token.firstName);
    });
  });

  db
    .table('messages')
    .changes()
    .run({cursor: true})
    .then(function (cursor) {
      cursor.each(function (err, row) {
        if(err) {
          throw err;
          process.exit(1);
        }

        io.to(row.new_val.groupId).emit('message', row.new_val);
        console.log('Sending a message to ' + row.new_val.groupId);

      });
    });
};

exports.getIO = function () {
  return io;
};
