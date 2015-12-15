'use strict';

var bodyParser = require('body-parser');
var cors = require('cors');
var db = require('./db');
var express = require('express');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var morgan = require('morgan');
var twilio = require('./twilio');
var util = require('./util');

var privateKey  = fs.readFileSync('ssl/key.pem', 'utf8');

// Initialize the Express Application
var app = express();

// Morgan Logger
if(process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Allow CORS
app.use(cors());

// Parse the incoming JSON objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (err, req, res, next) {
  console.error(err);
  twilio.sendSMS('4157130893', err)
    .then(function () {
      return twilio.sendSMS('5155202902', err);
    })
    .then(function () {
      res.status(500).send('An Error Occured. Please try again. If the problem persists, check back later.');
      next();
    });
});

// Load the public (core) routes
require('../app/routes/core.routes.js')(app);

// Add the Authorization Middleware
app.use(function (req, res, next) {
  var token = req.headers['x-access-token'];
  if(!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, privateKey, function(err, decoded) {
      if(err) {
        console.error(err);
        res.sendStatus(403);
      } else {
        db
          .table('users')
          .get(decoded.id)
          .run()
          .then(function (resp) {
            if(resp) {
              req.user = resp;
              delete req.user.password;
              next();
            } else {
              res.status(403).send('Stop Using Expired tokens!');
            }
          })
          .catch(function () {
            res.status(500).send('AN error occured with decrypting the token');
          });
      }
    });
  }
});

// Load the routes that are behind authorization
require('../app/routes/auth.routes.js')(app);

module.exports = app;
