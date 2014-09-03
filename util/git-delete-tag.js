'use strict';

var exec = require('child_process').exec;

var exports = module.exports = function(grunt) {
  grunt.registerTask('git-delete-tag', function() {
    var done = this.async();

    var local = this.args.indexOf('local') !== -1;
    var remote = this.args.indexOf('remote') !== -1;

    exports.deleteTag(grunt, local, remote, done);
  });
};

exports.deleteTag = function (grunt, local, remote, done) {
  if (!local && !remote) {
    local = remote = true;
  }
  var tag = grunt.option('deletetag') || process.env.TRAVIS_TAG;

  var queue = [];
  var next = function() {
    if (!queue.length) {
      return done();
    }

    queue.shift()();
  };

  var handleExec = function(err, stdout, stderr) {
    if (err) {
      grunt.fail.fatal(err);
    }
    grunt.log.debug(stdout);
    grunt.log.debug(stderr);
    next();
  };

  if (local) {
    queue.push(function() {
      exec('git tag -d ' + tag, handleExec);
    });
  }

  if (remote) {
    queue.push(function() {
      exec('git push github :' + tag, handleExec);
    });
  }

  next();
};
