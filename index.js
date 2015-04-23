var format = require('util').format;
var fs = require('fs');
var path = require('path');

var Promise = require('es6-promise').Promise;
//var rimraf = require('rimraf');

var utils = require('./utils');


// Default config values. All paths here should
// be considered relative to the directory used
// to build the styleguide.
var globalDefaults = {
  pageDir: 'pages',
  buildDir: 'build',
  configDir: 'config',
  contentExt: '.md',
  templateRender: function(path, context, config) {
    console.log(path);
    console.log(context);
    console.log(config);

  }
};


function getConfig(basePath, config, defaults) {
  config = config || require(path.join(basePath, 'config'));
  return utils.defaults(config, defaults || {});
}


function buildPages(basePath, config, defaults) {
  basePath = utils.absolutify(basePath);

  config = getConfig(basePath, config, defaults || globalDefaults);
  var pageDir = path.join(basePath, config.pageDir);
  if (!utils.isDir(pageDir)) {
    throw new Error(format('pagesDir %s is not a directory', pageDir));
  }

  var buildDir = path.join(basePath, config.buildDir);
  clean(buildDir)
    .then(function() {
      var files = fs.readdirSync(pageDir);
      var contentExt = config.contentExt;
      var configDir = path.join(basePath, config.configDir);

      for (var i=0; i<files.length; i++) {
        // Iterate over all the content files (default *.md) in the
        // pages directory
        var contentFile = files[i];
        var pageContext = {};

        if (path.extname(contentFile) !== contentExt) {
          continue;
        }
        // foo/bar/baz.md -> baz
        var baseName = path.basename(contentFile, contentExt);

        // If there's a matching js file in the config dir require it.
        var configPath = path.join(configDir, baseName, '.js');
        if (utils.isFile(configPath)) {
          config.pageConfig = require(configPath.replace('.js', ''));
        }

        if (config.pageConfig && config.pageConfig.templatePath) {
          var templatePath = config.pageConfig.templatePath;
          if (utils.isFile(path.join(path.dirname(configPath), templatePath))) {
            // If that contains a template path render it with any context and
            // write it out into iframe dir of the build directory.

          }
        }


        // Pass any context plus global context and render the page html

        // Render the markdow.
        pageContext.markdown = utils.renderMarkdown(contentFile);
      }
    }).catch(function(err) {
      throw err;
    });
}



function copyStaticFiles(buildDir) {
  console.log(buildDir);
}

function clean(buildDir, noop) {
  return new Promise(function(resolve, reject) {
    if (buildDir === '/') {
      reject(new Error('buildDir cannot be /'));
    }
    if (buildDir.indexOf(process.cwd()) === -1) {
      reject(new Error('buildDir must be under the CWD'));
    }

    if (noop) {
      // Only shows the top level not a recursive list.
      fs.readdir(buildDir, function(err, files) {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
    } else {
      resolve();
//      rimraf(buildDir, function(err) {
//        if (err) {
//          reject(err);
//        }
//        resolve();
//      });
    }
  });
}

module.exports = {
  buildPages: buildPages,
  clean: clean,
  copyStaticFiles: copyStaticFiles,
  getConfig: getConfig,
};
