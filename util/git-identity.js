'use strict';

var exec = require('child_process').exec;

module.exports = function(grunt, config, done) {

  var email = config.email;
  var name = config.name;

  exec(
    'git config user.email "' + email + '" && ' +
    'git config user.name "' + name + '" &&' +
    'git remote add github https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}',

    function(err, stdout, stderr) {
      if (err) {
        grunt.fail.fatal(err);
      }
      grunt.log.debug(stdout);
      grunt.log.debug(stderr);
      done();
    }
  );
};
