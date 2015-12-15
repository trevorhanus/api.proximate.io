'use strict';

module.exports = getSocketIPs;

function getSocketIPs (req, res) {
  res.send(['https://' + process.env.SOCKET1_HOST + '/', 'https://' + process.env.SOCKET2_HOST + '/']);
}
