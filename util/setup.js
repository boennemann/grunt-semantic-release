'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var async = require('async');
var which = require('npm-which').sync;
var YAML = require('js-yaml');

['git', 'grunt', 'travis'].forEach(function(module) {
  try {
    which(module);
  } catch (e) {
    console.log('ERROR: You need ' + module + ' installed and available in your PATH.');
    process.exit(0);
  }
});

module.exports = function(answers) {

  var cwd = process.cwd();
  var changelog = path.join(cwd, 'CHANGELOG.md');
  if(!fs.existsSync(changelog)) {
    console.log('Created empty `CHANGELOG.md`.');
    fs.writeFileSync(changelog, '');
  }

  var travis = path.join(cwd, '.travis.yml');
  if (!fs.existsSync(travis)) {
    console.log('Copied default `.travis.yml`.');
    var defaultTravis = fs.readFileSync(path.join(__dirname, '../assets/.travis.yml'));
    fs.writeFileSync(travis, defaultTravis);
  }


  var config = YAML.safeLoad(fs.readFileSync(travis));

  console.log('Added deploy hooks to `.travis.yml`.');

  ['before', 'after'].forEach(function(type) {
    var obj = config[type + '_deploy'];
    if (obj) {
      if (obj.indexOf('grunt ' + type + '-deploy') === -1) {
        obj.push('grunt ' + type + '-deploy');
      }
    } else {
      config[type + '_deploy'] = ['grunt ' + type + '-deploy'];
    }
  });

  config.deploy = {
    provider: 'npm',
    email: answers.npmEmail,
    on: {
      all_branches: true,
      tags: true
    }
  };

  console.log('Npm deploy config added to `.travis.yml`.');
  fs.writeFileSync(travis, YAML.safeDump(config));

  var gh = 'GH_TOKEN=' + answers.gitubToken;

  var handleTravis = function(cb) {
    return function(err, stdout, stderr) {
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
      cb.apply(this, arguments);
    };
  };

  console.log('About to do execute lots of `travis` commands.');
  console.log('Which usually takes a while.');

  async.series([
    function(cb) {
      exec('travis sync --no-interactive', handleTravis(cb));
    },
    function(cb) {
      exec('travis enable --no-interactive', handleTravis(cb));
    },
    function(cb) {
      exec('travis encrypt ' + answers.npmToken + ' --add deploy.api_key --no-interactive', handleTravis(cb));
    },
    function(cb) {
      exec('travis encrypt ' + gh + ' --add --no-interactive',  handleTravis(cb));
    },
  ], function() {
    console.log('Done with the `travis` stuff.');
    console.log('Now add this to your README.md if not done already and everything should be up and running\n');
    console.log('[![Build Status](https://travis-ci.org/hoodiehq/{REPONAME}.svg)](https://travis-ci.org/hoodiehq/{REPONAME})');
    console.log('[![Dependency Status](https://david-dm.org/hoodiehq/{REPONAME}.svg)](https://david-dm.org/hoodiehq/{REPONAME})');
    console.log('[![devDependency Status](https://david-dm.org/hoodiehq/{REPONAME}/dev-status.svg)](https://david-dm.org/hoodiehq/{REPONAME}#info=devDependencies)\n');
    console.log('You have to replace all occurances of {REPONAME}, obiously.\n');
    console.log('git add package.json README.md CHANGELOG.md Gruntfile.js .travis.yml');
    console.log('git commit -m \'chore(grunt): setup grunt-release-hoodie\'');
    console.log('git push origin master');
  });
};
