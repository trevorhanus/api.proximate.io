'use strict';

var db = require('../../../lib/db');

module.exports = isPhoneUnique;

function isPhoneUnique (req, res, next) {
  var phone = req.body.phoneNumber;

  if(!phone) {
    return res.status(400).send('Pleace specify a phoneNumber');
  }

  db.users.isPhoneUnique(phone)
    .then(function (isUnique) {
      if(isUnique) {
        res.status(200).send({unique: true});
      } else {
        res.status(409).send('false');
      }
    })
    .catch(next);
}
