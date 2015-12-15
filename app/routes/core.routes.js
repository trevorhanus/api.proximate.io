'use strict';

var c = require('../../lib/controllers');

module.exports = authRoutes;

//////////

function authRoutes (app) {
  // Root Routes
  app.route('/').get(function (req, res) {
    res.send('Welcome to the Party!');
  });

  // Login
  app.route('/api/login')
    .post(c.login.login);

  // Signup
  app.route('/api/signup/isPhoneUnique')
    .post(c.signup.isPhoneUnique);

  app.route('/api/signup/sendcode')
    .post(c.signup.sendCode);

  app.route('/api/signup/verifycode')
    .post(c.signup.verifyCode);

  app.route('/api/signup/signup')
    .post(c.signup.signup);

  app.route('/api/sockets')
    .get(c.sockets.getSocketIPs);
}
