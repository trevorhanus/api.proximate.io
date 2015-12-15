'use strict';

var db = require('../../../lib/db');

module.exports = createMessage;

//////////

function createMessage (req, res, next) {
  var message = {
    // gorupId - Secondary Index
    groupId: req.body.groupId,
    // who sent it { id, name }
    user: {
      id: req.user.id,
      name: req.user.firstName + ' ' + req.user.lastName
    },
    // body / content
    content: req.body.content,
    // url to data
    url: null,
    // type : 'text', 'picture', 'file', 'safety'
    type: req.body.type,
    // Seen by who object
    seenBy: {},
    // datetime
    createdAt: Date.now()
  };

  message.seenBy[req.user.id] = true;

  db.messages.insertMessage(message)
    .then(function () {
      res.sendStatus(201);
    })
    .catch(next);
}
