var cog = require('../index');

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('cog', 'builds cog styleguide', function() {
    // Options if set are passed as config so what would otherwise
    // live in config.js can live in the Gruntfile.
    var options = this.options();

    console.log(options);
    // The documenation src dir.
    var src = this.data.src;

    try {
      if (options) {
        cog.buildPages(src, options);
      } else {
        cog.buildPages(src);
      }
    } catch(e) {
      grunt.fail.warn(e);
    }
  });

};
