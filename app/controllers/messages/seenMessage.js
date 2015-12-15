'use strict';

var db = require('../../../lib/db');

module.exports = seenMessage;

//////////

function seenMessage (req, res, next) {
  db.messages.seenMessage(req.messageId, req.user.id)
    .then(function () {
      res.status(200).send('Marked as Seen');
    })
    .catch(next);
}
