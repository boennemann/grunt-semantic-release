module.exports = function (grunt) {

  grunt.initConfig({
    release: {
      email: 'stephan@boennemann.me',
      name: 'Stephan Bönnemann'
    }
  });

  grunt.registerTask('test', function() {
    console.log(grunt.config.get('release'));
    grunt.log.warn('no tests yet :(');
  });

  grunt.loadTasks('tasks');

};
