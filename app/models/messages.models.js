'use strict';

module.exports = function (db) {
  db.messages = {};
  db.messages.insertMessage = insertMessage;
  db.messages.seenMessage = seenMessage;

  function insertMessage (message) {
    return db
      .table('messages')
      .insert(message)
      .run();
  }

  function seenMessage (id, userId) {
    var uMessage = {};
    uMessage.seenBy = {};
    uMessage.seenBy[userId] = true;

    return db
      .table('messages')
      .get(id)
      .update(uMessage)
      .run();
  }
}
