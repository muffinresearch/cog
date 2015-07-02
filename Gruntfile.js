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

    'gh-pages': {
      options: {
        base: 'docs/build',
        message: 'Updating docs'
      },
      src: ['**']
    },

    // Styleguide builder task.
    'cog': {
      'basic': {
        src: 'tests/grunt-examples/basic',
      },
      'basicopts': {
        src: 'tests/grunt-examples/basic',
        options: {
          templateGlobals: {
            'projectName': 'Basic Options',
          }
        }
      },
      'docs': {
        src: 'docs',
      }

    }

  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-devserver');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Actually load cog's own task.
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['mochaTest', 'jshint']);
  grunt.registerTask('publish-docs', ['test', 'gh-pages']);
};
