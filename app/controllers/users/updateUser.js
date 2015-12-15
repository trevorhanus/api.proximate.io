'use strict';

var db = require('../../../lib/db');

module.exports = updateUser;

function updateUser(req, res, next) {
  var user = {};

  new Promise(function (resolve, reject) {
    if(req.body.companyId) {
      user.companyId = req.body.companyId;
      db
        .table('companies')
        .get(req.body.companyId)
        .run()
        .then(function (company) {
          user.companyName = company.name;
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    } else {
      resolve();
    }
  })
  .then(function () {
    return db
      .table('users')
      .get(req.user.id)
      .update(user)
      .run()
  })
  .then(function () {
    res.sendStatus(200);
  })
  .catch(next);
}

// function routeHandler (req, res, next) {

//   function retrieveCompanyId (req, res, next) {
//     if(req.body.companyId) {
//       user.companyId = req.body.companyId;
//       db
//         .table('companies')
//         .get(req.body.companyId)
//         .run()
//         .then(function (company) {
//           user.companyName = company.name;
//           next();
//         })
//         .catch(function (err) {
//           next(err);
//         });
//     } else {
//       next();
//     }
//   }

//   return [
//     retrieveCompanyId,
//     updateUser
//     respond
//   ]

// }
