'use strict';

var ccl = require('conventional-changelog');
var exec = require('child_process').exec;
var inquirer = require('inquirer');

var exports = module.exports = function(grunt, cb) {
  exec('git fetch --tags', function(stderr) {
    if (stderr) {
      grunt.log.error('Couldn\'t fetch tags.');
      grunt.log.error(stderr);
      // No need to abort though
    }
    grunt.log.ok('Latest tags pulled.');

    ccl({
      file: false,
      version: '13.3.7',
      log: grunt.log.debug
    }, function(err, log) {
      if (err) {
        cb(err);
      }

      return exports.suggest(grunt, {
        breaking: /# breaking changes/i.test(log),
        features: /# features/i.test(log),
        fixes: /# bug fixes/i.test(log)
      }, cb);
    });
  });
};

exports.suggest = function(grunt, changes, cb) {
  if (!(changes.breaking || changes.features || changes.fixes)) {
    grunt.log
      .warn('According to the changes made you shouldn\'t release a new version yet.')
      .warn('Did you stick to the commit message conventions?');
  }

  inquirer.prompt([{
    type: 'checkbox',
    name: 'changes',
    message: 'What kind of changes did you make?',
    choices: [
      {
        name: 'breaking',
        checked: changes.breaking
      },
      {
        name: 'features',
        checked: changes.features
      },
      {
        name: 'fixes',
        checked: changes.fixes
      },
      new inquirer.Separator('Or abort this and do not release a new version yet.'),
      {
        name: 'abort',
        checked: !(changes.breaking || changes.features || changes.fixes)
      }
    ]
  }], function(answers) {
    function has(arr, type) {
      return arr.indexOf(type) !== -1;
    }
    if (has(answers.changes, 'abort')) {
      return cb('abort');
    }
    var type = 'patch';
    if (has(answers.changes, 'features')) {
      type = 'minor';
    }
    if (has(answers.changes, 'breaking')) {
      type = 'major';
    }
    cb(type);
  });
};
