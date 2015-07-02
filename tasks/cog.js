var cog = require('../lib/');

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('cog', 'builds cog styleguide', function() {
    // Options if set are passed as config so what would otherwise
    // live in config.js can live in the Gruntfile.
    var options = this.options();

    // Ignore options if it's an empty object.
    if (Object.keys(options).length === 0) {
      options = null;
    }

    // The documenation src dir.
    var src = this.data.src;

    try {
      cog.buildPages(src, options);
    } catch(e) {
      grunt.fail.warn(e);
    }
  });

};
