'use strict';

var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var twilio = {};

twilio.sendSMS = function (to, message) {
  return new Promise(function (resolve, reject) {
    var msg = {
      to: to,
      from: process.env.TWILIO_BRIDGE_FROM,
      body: message
    };

    client.sendMessage(msg, function (err, response) {
      if(err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};

twilio.sendCode = function(user) {
  return twilio.sendSMS(user.phoneNumber, 'Your Bridge code is: ' + user.code);
};

twilio.sendInviteToBridge = function (phoneNumber) {
  return twilio.sendSMS(phoneNumber, 'Sign Up for Bridge Now! Or else.....');
};

twilio.sendInviteToJobSite = function (user, jobSite) {
  return twilio.sendSMS(user.phoneNumber, 'Go join the ' + jobSite.name + ' jobsite!');
};

module.exports = twilio;
