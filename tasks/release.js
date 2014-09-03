var fs = require('fs');

var extend = require('extend');

var semverSuggest = require('../util/semver-suggest');

module.exports = function(grunt) {
  grunt.registerTask('release', 'Schedules a release to be deployed by CI', function() {

    var done = this.async();
    var originalPackage = fs.readFileSync('./package.json');

    // manually load tasks
    require('../util/git-delete-tag')(grunt);
    grunt.loadTasks(require('path').join(__dirname, '../node_modules/grunt-bump/tasks'));

    var options = extend({
      bump: {}
    }, grunt.config.get('release'));

    var bump = {
      files: options.bump.files || ['package.json'],
      commit: false,
      createTag: true,
      tagName: 'release-v%VERSION%',
      pushTo: options.bump.pushTo || 'origin master',
    };

    grunt.log.debug('Note: No pushing in debug mode');

    if (grunt.option('debug')) {
      bump.push = false;
    }

    grunt.registerTask('set-tag', function() {
      var pkg = grunt.file.readJSON('./package.json');
      grunt.option('deletetag', 'release-v'+pkg.version);
    });

    grunt.registerTask('reset-package', function() {
      fs.writeFileSync('./package.json', originalPackage);
    });

    grunt.config.set('bump', {options: bump});
    var tasks = ['bump', 'set-tag','git-delete-tag:local', 'reset-package'];

    if (!(this.args.length || grunt.option('setversion'))) {
      return semverSuggest(grunt, function(suggestion) {
        if (suggestion === 'abort') {
          grunt.log.warn('Release aborted');
          return done();
        }
        tasks[0] = tasks[0] + ':' + suggestion;
        grunt.task.run(tasks);
        done();
      });
    }

    if (this.args.length) {
      tasks[0] = tasks[0] + ':' + this.args.join(':');
    }

    grunt.task.run(tasks);
    done();
  });
};
