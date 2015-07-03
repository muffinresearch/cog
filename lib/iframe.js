var fs = require('fs');
var path = require('path');

var yaml = require('js-yaml');
var yfm = require('yfm');

var grunt = require('grunt');
var utils = require('./utils');
var renderers = require('./renderers');


module.exports = {

  parseIframeCodeFence: function(content, opts) {
    opts = opts || {};
    // Try to parse content as yaml
    // if it's solely config.
    var iframeConfig = {};
    try {
      iframeConfig = yaml.safeLoad(content);
      // If yaml was parsed OK, config should be an
      // object.
      if (typeof iframeConfig !== 'object') {
        throw new Error('Not valid yaml');
      }
      // A renderer should be defined.
      if (!iframeConfig.renderer) {
        throw new Error(
          'No renderer exists with that name:', iframeConfig.renderer);
      }
      // console.log('Iframe render yaml config found', iframeConfig);
    } catch (e) {
      // console.log('Parsing with yfm');
      var parsedIframe = yfm(content);
      iframeConfig = parsedIframe.context || {};
      iframeConfig.content = parsedIframe.content;
      iframeConfig.sourcecodeSelector = parsedIframe.context.sourcecodeSelector;
    }

    var id = opts.baseName + opts.index;
    iframeConfig.id = id;
    iframeConfig.iframeFilePath = path.join('iframe', id + '.html');
    iframeConfig.breakPoints = utils.getBreakPointConf(
                                 iframeConfig.breakPoints || opts.breakPoints);
    return iframeConfig;
  },

  buildIframePage: function(iframeConfig, projectConfig) {
    // Render the iframe code into the iframe html file.
    var iframeContent = '';
    var iframeHTML = '';
    var renderer = renderers[iframeConfig.renderer];
    if (renderer) {
      // console.log('iframe builder: We have a renderer');
      try {
        iframeContent = renderer(
          iframeConfig.template,
          utils.defaults(iframeConfig, projectConfig.templateGlobals),
          utils.defaults(iframeConfig.templateConfig,
                         projectConfig.templateConfig)
        );
      } catch(e) {
        if (e.toString().indexOf('template not found') === -1 ||
            e.toString().indexOf('Template render error') > -1) {
          throw e;
        } else {
          grunt.log.warn(e.toString().replace('Error', 'Warning'));
        }
      }
    } else {
      renderer = renderers.nunjucks;
      iframeConfig.iframeContent = iframeConfig.content;
      iframeContent = renderer(
        iframeConfig.template || 'cog-iframe-content.html',
        utils.defaults(iframeConfig, projectConfig.templateGlobals),
        utils.defaults(iframeConfig.templateConfig,
                       projectConfig.templateConfig)
      );
    }

    if (iframeContent) {
      iframeHTML = utils.prettyHTML(iframeContent);
      fs.writeFileSync(
        path.join(projectConfig.buildDir, iframeConfig.iframeFilePath),
        iframeHTML
      );
    }

    return iframeHTML;
  }
};
