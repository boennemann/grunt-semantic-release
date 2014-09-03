var semverRegex = require('semver-regex')();

var preparationTag = require('../util/preparation-tag');

module.exports = function(grunt) {
  'use strict';
  var tag = process.env.TRAVIS_TAG;
  var isPreparation = preparationTag(tag);
  var isRelease = semverRegex.test(tag);

  // NOTE: These tasks are only meant to be run on CI. I won't work locally.
  grunt.registerTask('before-deploy', function() {
    if (isPreparation) {
      grunt.log.ok('Preparing release ' + isPreparation);
      return grunt.task.run(['prepare-release']);
    }
    if (isRelease) {
      return grunt.log.ok('Releasing new version ' + tag);
    }
    return grunt.fail.fatal('Invalid tag format used ' + tag);
  });

  grunt.registerTask('after-deploy', function() {
    if (isRelease) {
      grunt.log
        .ok(tag + ' released.')
        .ok('Publishing release to GitHub');
      return grunt.task.run(['github-release']);
    }
    return grunt.fail.fatal('Invalid tag format used.');
  });
};
