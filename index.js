var format = require('util').format;
var fs = require('fs-extra');
var path = require('path');

var nunjucks = require('nunjucks');

var utils = require('./utils');


// Default config values. All paths here should
// be considered relative to the directory used
// to build the styleguide.
var globalDefaults = {
  pageDir: 'pages',
  buildDir: 'build',
  configDir: 'config',
  contentExt: '.md',
  // The default nunjucjs renderer. This means you can override
  // the template renderer with any other template lib you want to use.
  templateRenderer: function(template, context, config) {
    config = config || {};
    var templatePaths = config.templatePaths || [];
    var nunjucksLoaders = [];
    for (var i=0; i < templatePaths.length; i++) {
      var templDirPath = templatePaths[i];
      nunjucksLoaders.push(new nunjucks.FileSystemLoader(templDirPath));
    }

    // Append cog's own templates onto the template path list.
    nunjucksLoaders.push(new nunjucks.FileSystemLoader(
                         path.join(__dirname, 'templates')));

    console.log(path.join(__dirname, 'templates'));

    var nunjucksConfig = config.nunjucksConfig || {};
    var env = new nunjucks.Environment(nunjucksLoaders, nunjucksConfig);
    return env.render(template, context);
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

  // Cleanout the build dir.
  cleanSync(buildDir);

  if (!utils.isDir(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  var files = fs.readdirSync(pageDir);
  var contentExt = config.contentExt;
  var configDir = path.join(basePath, config.configDir);

  for (var i=0; i<files.length; i++) {
    // Iterate over all the content files (default *.md) in the
    // pages directory
    var contentFile = path.join(pageDir, files[i]);
    var pageContext = {};

    if (path.extname(contentFile) !== contentExt) {
      continue;
    }
    // foo/bar/baz.md -> baz
    var baseName = path.basename(contentFile, contentExt);

    // If there's a matching js file in the config dir require it.
    var configPath = path.join(configDir, baseName + '.js');
    console.log('configPath: %s', configPath);
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

    // Render the markdow.
    console.log(contentFile);
    pageContext.markdown = utils.renderMarkdown(contentFile);

    var pageTemplate = 'cog-page.html';
    if (baseName === 'index') {
      pageTemplate = 'cog-index.html';
    }

    // Pass any context plus global context and render the page html
    var rendered = config.templateRenderer(pageTemplate, pageContext,
                                           config.templateConfig || {});

    var builtPagePath = path.join(buildDir, baseName + '.html');
    fs.writeFileSync(builtPagePath, rendered);
  }

  copyStaticFiles(path.join(__dirname, 'static'), buildDir);
}


function copyStaticFiles(from, to) {
  return fs.copySync(from, to);
}

function cleanSync(buildDir, noop) {
  if (buildDir === '/') {
    throw new Error('buildDir cannot be /');
  }
  if (buildDir.indexOf(process.cwd()) === -1) {
    throw new Error('buildDir must be under the CWD');
  }
  if (noop) {
    // Only shows the top level not a recursive list.
    return fs.readdirSync(buildDir);
  } else {
    //return emptyDirSync(buildDir);
  }
}

module.exports = {
  buildPages: buildPages,
  cleanSync: cleanSync,
  copyStaticFiles: copyStaticFiles,
  getConfig: getConfig,
};
