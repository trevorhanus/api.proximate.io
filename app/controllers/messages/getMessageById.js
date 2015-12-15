'use strict';

module.exports = getMessageById;

//////////

function getMessageById (req, res, next, id) {
  req.messageId = id;
  next();
}
