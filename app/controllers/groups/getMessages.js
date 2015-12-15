'use strict';

var db = require('../../../lib/db');

module.exports = getMessages;

function getMessages (req, res, next) {
  var time = new Date();
  db
    // .table('messages', {readMode: '_debug_direct'})
    .table('messages', {readMode: 'outdated'})
    // .table('messages')
    .between([req.group.id, db.minval], [req.group.id, db.maxval], {index: "groupIdAndCreatedAt", leftBound:'open'})
    .orderBy({index: db.desc('groupIdAndCreatedAt')})
    .limit(50)
    // .skip(50)
    .run()
    .then(function (messages) {
      // messages = messages.reverse();
      // if(messages.length>100){
      //   messages = messages.slice(messages.length-50, messages.length);
      // }
      
      var result = {};
      messages.forEach(function (message) {
        result[message.id] = message;
      });
      console.log(new Date() - time);
      res.status(200).send(result);
    })
    .catch(next);
}


/*

r.db('bridge').table('messages')
  .orderBy({index: 'createdAt'})
  .filter({groupId: "fa18fb14-c231-41cf-90c6-a59bef2c41df"})

r.db('bridge').table('messages')
  .getAll("fa18fb14-c231-41cf-90c6-a59bef2c41df", {index: 'groupId'})

*/