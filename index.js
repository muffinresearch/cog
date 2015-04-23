var format = require('util').format;
var fs = require('fs-extra');
var path = require('path');

var grunt = require('grunt');
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
  // The default nunjucks renderer. This means you can override
  // the template renderer with any other template lib you want to use.
  templateRenderer: function(template, context, config) {
    config = config || {};
    var basePath = config.basePath;
    var templatePaths = config.templatePaths || [];
    var nunjucksLoaders = [];
    for (var i=0; i < templatePaths.length; i++) {
      var templDirPath = path.join(basePath, templatePaths[i]);
      nunjucksLoaders.push(new nunjucks.FileSystemLoader(templDirPath));
    }

    // Append cog's own templates onto the template path list.
    nunjucksLoaders.push(new nunjucks.FileSystemLoader(
                         path.join(__dirname, 'templates')));

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

  var templateConfig = {
    basePath: basePath,
  };

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

  var iframeDir = path.join(buildDir, 'iframe');
  if (!utils.isDir(iframeDir)) {
    fs.mkdirSync(iframeDir);
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

    var pageConfig = {};
    // If there's a matching js file in the config dir require it.
    var configPath = path.join(configDir, baseName + '.js');
    if (utils.isFile(configPath)) {
      pageConfig = require(configPath.replace('.js', ''));
    }

    pageConfig = utils.defaults(pageConfig, config);

    var renderer = config.templateRenderer;

    var iframeContent = '';
    var iframeTemplate = baseName + '.html';
    // If we've been handed a template name then use that instead.
    if (pageConfig.iframeTemplate) {
      iframeTemplate = pageConfig.iframeTemplate;
    }

    // If that contains a template path render it with any context and
    // write it out into iframe dir of the build directory.
    try {
      var iframeContext = utils.defaults(config.templateGlobals || {},
                                         pageConfig.iframeContext || {});
      iframeContent = renderer(iframeTemplate, iframeContext,
         utils.defaults(templateConfig, config.templateConfig));
    } catch(e) {
      if (e.toString().indexOf('template not found') === -1 ||
          e.toString().indexOf('Template render error') > -1) {
        throw e;
      } else {
        grunt.log.warn(e.toString().replace('Error', 'Warning'));
      }
    }

    if (iframeContent !== '') {
      var iframeContentPath = path.join(buildDir, 'iframe', baseName + '.html');
      fs.writeFileSync(iframeContentPath, iframeContent);
      pageContext.iframeSrc = baseName + '.html';

      // Now highlight the content under sourcecodeSelector so we can include
      // that in the rendered page.
      var snippet = utils.getContentBySelector(iframeContent,
                                               pageConfig.sourcecodeSelector);
      snippet = utils.prettyHTML(snippet);
      pageContext.code = utils.highlight(snippet);
    }

    // Render the markdown.
    pageContext.markdown = utils.renderMarkdown(contentFile);
    pageContext = utils.defaults(pageContext, config.templateGlobals || {});

    var pageTemplate = 'cog-page.html';
    if (baseName === 'index') {
      pageTemplate = 'cog-index.html';
    }

    // Pass any context plus global context and render the page html
    var rendered = renderer(pageTemplate, pageContext,
      utils.defaults(templateConfig, config.templateConfig));

    var builtPagePath = path.join(buildDir, baseName + '.html');
    fs.writeFileSync(builtPagePath, rendered);
  }

  // Copy all the cog static files into the build dir.
  fs.copySync(path.join(__dirname, 'static'), path.join(buildDir, 'cog'));

  // Copy other files into build dir
  if (config.copy && config.copy.length) {
    for (var j=0; j < config.copy.length; j++) {
      var map = config.copy[j];
      var src = path.join(basePath, map.src);
      var target = path.join(buildDir, map.target);
      if (src.indexOf(process.cwd()) === -1) {
        throw Error('Cannot copy files from location outside of CWD');
      }
      if (target.indexOf(buildDir) === -1) {
        throw Error('Cannot copy files into location outside of buildDir');
      }
      fs.copySync(src, target);
    }
  }
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
    return fs.emptyDirSync(buildDir);
  }
}

module.exports = {
  buildPages: buildPages,
  cleanSync: cleanSync,
  getConfig: getConfig,
};
