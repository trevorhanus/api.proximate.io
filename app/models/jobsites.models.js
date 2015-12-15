'use strict';

module.exports = function (db) {
  db.jobSites = {};
  db.jobSites.getJobSite = getJobSite;
  db.jobSites.isAdmin = isAdmin;
  db.jobSites.isMember = isMember;
  db.jobSites.validate = validate;

  db.jobSites.schema = {
    name: {
      required: true,
      type: 'string'
    }
  };

  function getJobSite (id) {
    return db
      .table('jobSites')
      .get(id)
      .run();
  }

  function isAdmin (userId, jobSiteId) {
    return db
      .table('jobSites')
      .get(jobSiteId)
      .run()
      .then(function (jobSite) {
        for (var i = 0; i < jobSite.members.length; i++) {
          if (jobSite.members[i].id === userId  && jobSite.members[i].admin === true) {
            return true;
          }
        }
        return false;
      });
  }

  function isMember (userId, jobSiteId) {
    return db
      .table('jobSites')
      .get(jobSiteId)
      .run()
      .then(function (jobSite) {
        for (var i = 0; i < jobSite.members.length; i++) {
          if (jobSite.members[i].id === userId) {
            return true;
          }
        }
        return false;
      });
  }

  function validate (jobSite) {
    return db.validateSchema(db.jobSites.schema, jobSite);
  }
};
