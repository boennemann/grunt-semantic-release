var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var extend = require('extend');

var gitIdentity = require('../util/git-identity');
var preparationTag = require('../util/preparation-tag');

module.exports = function (grunt) {
  'use strict';

  // NOTE: This task is only meant to be run on CI. I won't work locally.
  grunt.registerTask('prepare-release', 'Prepares a tagged release commit on CI', function() {

    // manually load tasks
    require('../util/git-delete-tag')(grunt);
    ['grunt-bump', 'grunt-conventional-changelog'].forEach(function(task) {
      grunt.loadTasks(require('path').join(__dirname, '../node_modules', task, 'tasks'));
    });

    var version = preparationTag(process.env.TRAVIS_TAG);
    grunt.option('setversion', version);

    // task default options
    var options = {
      tasks: ['changelog']
    };

    // task options merged with gruntfile
    extend(options, grunt.config.get('release'));

    // grunt-bump default options
    var bump = {
      commitMessage: 'chore(release): v%VERSION%',
      files: [],
      commitFiles: ['-a']
    };

    ['package.json', 'bower.json', 'component.json'].forEach(function(file) {
      if (fs.existsSync(file)) {
        bump.files.push(file);
      }
    });

    if (!options.bump) {
      options.bump = {};
    }

    for (var option in bump) {
      if (!options.bump[option]) {
        options.bump[option] = bump[option];
      }
    }

    // pushTo is forced to this setting so the release commit can be pushed back to git
    options.bump.pushTo = 'github HEAD:master';

    grunt.log.debug('Note: No comitting, tagging or pushing in debug mode');
    grunt.log.debug(
      'Using the following options for grunt-bump:\n' +
      JSON.stringify(options.bump, null, 2)
    );

    // without failing the build travis-deploy-hooks would already run through
    grunt.registerTask('abort-deploy', function() {
      grunt.fail.fatal('Release prepared. Failing the build on purpose.');
    });

    options.tasks.unshift('bump-only');
    options.tasks.unshift('git-delete-tag');
    options.tasks.push('bump-commit');
    options.tasks.push('abort-deploy');

    if (grunt.option('debug')) {
      options.bump.commit = options.bump.createTag = options.bump.push = false;
    }

    grunt.config.set('bump', {options: options.bump});

    if (process.env.CI || process.env.TRAVIS || process.env.CONTINUOUS_INTEGRATION) {
      // make sure CI can push back to git
      grunt.registerTask('git-identity', function() {
        gitIdentity(grunt, options, this.async());
      });

      options.tasks.unshift('git-identity');
    }

    grunt.log.debug(
      'Running the following tasks: ' +
      grunt.log.wordlist(options.tasks)
    );

    grunt.task.run(options.tasks);

  });
};
