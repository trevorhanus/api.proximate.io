'use strict';

var db = require('../../../lib/db');

module.exports = verifyCode;

function verifyCode (req, res, next) {
  // check if given code matches the phone number in the phoneNumberCodes table
  var code = req.body.code;
  var phoneNumber = req.body.phoneNumber;

  db.table('phoneNumberCodes')
    .getAll(phoneNumber, {index: "phoneNumber"})
    .then(function (rows) {
      if(rows.length === 0 || rows[0].code !== code) {
        res.status(400).send('noMatch');
      } else {
        res.status(200).send('match');
      }
    })
    .catch(next);

}
