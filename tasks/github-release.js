var exec = require('child_process').exec;

var GitHubApi = require('github');

var github = new GitHubApi({
  version: '3.0.0',
  debug: true
});

module.exports = function(grunt) {
  'use strict';

  // NOTE: This task is only meant to be run on CI. I won't work locally.
  grunt.registerTask('github-release', 'Creates a Github release.', function() {
    var done = this.async();
    var queue = [];

    var next = function() {
      if (!queue.length) {
        return done();
      }

      queue.shift()();
    };

    var run = function(behavior) {
      queue.push(behavior);
    };

    var slug = (process.env.TRAVIS_REPO_SLUG || '').split('/');
    var releasePayload = {
      owner: slug[0],
      repo: slug[1],
      tag_name: process.env.TRAVIS_TAG,
      //body: ,
      draft: grunt.option('debug')
    };

    var changes;
    var owner = slug[0];
    var repo = slug[1];
    var tag = process.env.TRAVIS_TAG;

    grunt.log.debug('Publishing ' + tag + ' for ' + owner + '/' + repo);

    run(function() {
      // extract latest addition to changelog from git diff
      exec('git diff -U0 --no-color HEAD^ CHANGELOG.md', function(err, stdout, stderr) {
        if (err) {
          grunt.fail.fatal(err);
        }

        changes = stdout.split('\n');
        changes.splice(0, 7);
        changes = changes.join('\n').replace(/^\+/gm, '');

        releasePayload.body = changes;

        grunt.log.debug(stdout);
        grunt.log.debug(stderr);

        next();
      });
    });

    var fn = (grunt.config.get('release') || {}).payload;
    if (fn && typeof fn === 'function') {
      run(function() {
        fn(releasePayload, function(payload) {
          if (payload) {
            releasePayload = payload;
          }
          next();
        });
      });
    }

    run(function() {
      github.authenticate({
        type: 'oauth',
        token: process.env.GH_TOKEN
      });
      github.releases.createRelease(releasePayload, function(err) {
        if (err) {
          grunt.fail.fatal(err);
        }

        grunt.log.ok('GitHub release published');

        next();
      });
    });

    next();
  });
};
