'use strict';

var db = require('../../../lib/db');

module.exports = createGroup;

function createGroup (req, res, next) {
  var user = {
    id: req.user.id, 
    name: req.user.displayName
  };

  var group = {};
  group.name = req.body.name;
  group.type = req.body.type;
  group.jobSiteId = req.body.jobSiteId;
  group.members = [user];
  
  if(group.type !== 'public' && group.type !== 'private' && group.type !== 'directMessage') {
    return res.status(400).send({error: 'Invalid group type.'});
  }
  
  var member = false;
  for(var i = 0; i < req.user.jobSites.length; i++) {
    if(req.user.jobSites[i].id === group.jobSiteId) {
      member = true;
    }  
  }
  if(!member) {
    return res.status(403).send({error: 'Your not a member of the specified group.'});
  }
  
  db
    .table('groups')
    .insert(group, {returnChanges: true})
    .run()
    .then(function (newGroup) {
      var nGroup = {
        id: newGroup.changes[0].new_val.id,
        name: newGroup.changes[0].new_val.name
      };
      return db.users.addGroup(nGroup, req.user.id)
        .then(function () {
          res.status(201).send(newGroup.changes[0].new_val);
        });
    })
    .catch(next);
}
