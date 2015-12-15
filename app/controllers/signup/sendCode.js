'use strict';

var db = require('../../../lib/db');
var twilio  = require('../../../lib/twilio');

module.exports = sendCode;

function sendCode (req, res, next) {

  if(!req.body.phoneNumber) {
    return res.status(400).send({error: 'No phoneNumber Specified.'});
  }

  // generate a random code and convert to a string
  var code = String(Math.floor(Math.random() * 10000));

  // We need to make sure the code has 4 digits so append a 0 to the beginning if needed.
  while (code.length < 4) {
    code = '0' + code;
  }

  // create the row object to insert into the database
  var row = {
    phoneNumber: req.body.phoneNumber,
    code: code
  };

  db.users.isPhoneUnique(row.phoneNumber)
    .then(function (isUnique) {
      if(!isUnique) {
        // If so, return conflict status
        res.status(409).send({error: 'Phone Number already registered.'});
      } else {
        // If not, continue the promise chain
        return db
          .table('phoneNumberCodes')
          .insert(row, {conflict: "replace"})
          .run()
          .then(function () {
            // Send the Code via SMS
            return twilio.sendCode(row);
          })
          .then(function () {
            // Return Success
            res.status(200).send({message: 'Success'});
          });
      }
    })
    .catch(next);
}
