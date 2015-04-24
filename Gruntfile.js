module.exports = function(grunt) {
  grunt.initConfig({
    bower: {
      styleguide: {
        options: {
          targetDir: './static/lib',
          layout: 'byComponent',
          install: true,
          bowerOptions: {
            production: true,
          }
        }
      }
    },

    jshint: {
      options: {
        jshintrc: true,
      },
      all: ['*.js', 'test/**/*.js'],
    },

    mochaTest: {
      options: {
        require: [
          function(){
            /* jshint -W020 */
            assert = require('chai').assert;
          },
        ],
        reporter: 'spec',
      },
      all: ['tests/*.js']
    },

    devserver: {
      options: {
        base: 'docs/build',
        type: 'http',
        port: grunt.option('port') || 4000,
      },
      server: {}
    },

  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-devserver');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['jshint', 'mochaTest']);
};
