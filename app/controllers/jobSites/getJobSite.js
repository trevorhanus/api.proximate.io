'use strict';

module.exports = getJobSite;

//////////

function getJobSite (req, res) {
  if(req.jobSite) {
    res.status(200).send(req.jobSite);
  } else {
    res.status(404).send('Jobsite Not Found.');
  }
}
