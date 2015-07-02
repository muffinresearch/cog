var format = require('util').format;
var fs = require('fs-extra');
var path = require('path');

var grunt = require('grunt');
var yfm = require('yfm');

var utils = require('./utils');
var iframe = require('./iframe');
var renderers = require('./renderers');

var md = require('markdown-it')({
  html: true,
  linkify: true,
});

var iframeBlockRX = /^[`]{3} ?iframe\s+([\s\S]*?)[`]{3}/mg;

// Default config values. All paths here should
// be considered relative to the directory used
// to build the styleguide.
var projectDefaults = {
  pageDir: 'pages',
  buildDir: 'build',
  contentExt: '.md',
  // Break points determine the buttons created to allow the user
  // to change the resizable iframe to preset sizes.
  breakPoints: [
    {
      name: 'Phone',
      w: 350,
      h: 598
    }, {
      name: 'Tablet',
      w: 600,
      h: 887
    }
  ],
  templateGlobals: {
    projectName: 'COG',
  }
};


function getConfig(basePath, config, defaults) {
  config = config || require(path.join(basePath, 'config'));
  return utils.defaults(config, defaults || {});
}


function prepareBuildDir(buildDir) {
  // Cleanout the build dir.
  cleanSync(buildDir);
  // Re-create the buildDir
  if (!utils.isDir(buildDir)) {
    fs.mkdirSync(buildDir);
  }
}


function getPageList(pageDir, buildDir, projectConfig) {
  var contentExt = projectConfig.contentExt;
  var files = fs.readdirSync(pageDir);
  var pageList = [];

  // Initial iteration to get all page basenames so
  // we can provide a complete navigation to each page.
  for (var i=0; i<files.length; i++) {
    // Iterate over all the content files (default *.md) in the
    // pages directory
    var contentFile = path.join(pageDir, files[i]);
    if (path.extname(contentFile) !== contentExt) {
      continue;
    }
    // foo/bar/baz.md -> baz
    var baseName = path.basename(contentFile, contentExt);

    // Separate the front matter from the md.
    var parsed = yfm.read(contentFile);
    var markdown = parsed.content;
    var context = parsed.context;

    // Pre-process iframe blocks from markdown.
    var match = iframeBlockRX.exec(markdown);
    //console.log(match);
    var iframeIdx = 1;
    while (match != null) {

      var iframeConfig = iframe.parseIframeCodeFence(match[1], {
        index: iframeIdx,
        baseName: baseName,
        buildDir: buildDir,
        breakPoints: projectConfig.breakPoints,
      });

      // Write out the iframe page based on the config.
      // console.log('Writing out the iframe to a file');
      var iframeHTML = iframe.buildIframePage(iframeConfig, projectConfig);

      // Now highlight the content under sourcecodeSelector so we can include
      // that in the rendered page.
      var snippet = utils.getContentBySelector(iframeHTML,
        iframeConfig.sourcecodeSelector || projectConfig.sourcecodeSelector);
      // console.log(iframeConfig);
      snippet = utils.prettyHTML(snippet);
      iframeConfig.code = utils.highlight(snippet);

      // Get the HTML for displaying the iframe
      // and replace the code fence block.
      var replacement = renderers.nunjucks(
        '_iframe.html', iframeConfig, projectConfig.templateConfig);

      // console.log('Replacing iframe code block with rendered code');
      markdown = markdown.replace(match[0], replacement);

      match = iframeBlockRX.exec(markdown);
      iframeIdx += 1;
    }

    var html = md.render(markdown);

    // Grab the heading to use for title + nav.
    var heading = utils.getTextBySelector(html, 'h1');
    if (!heading) {
      grunt.log.warn('Missing heading in %s', contentFile);
    }
    var id = utils.textToId(heading);

    pageList.push({
      baseName: baseName,
      context: context,
      href: './' + baseName + '.html',
      html: html,
      heading: heading,
      id: id,
    });
  }
  return pageList;
}

function createIframeDir(buildDir) {
  // Make the iframe dir if needed.
  var iframeDir = path.join(buildDir, 'iframe');
  if (!utils.isDir(iframeDir)) {
    fs.mkdirSync(iframeDir);
  }
  return iframeDir;
}

function buildPages(basePath, config, defaults) {

  basePath = utils.absolutify(basePath);
  // console.log(config);
  var projectConfig = getConfig(basePath, config, defaults || projectDefaults);
  var pageDir = path.join(basePath, projectConfig.pageDir);

  // Add basePath to templateConfig.
  projectConfig.templateConfig = utils.defaults(
    {basePath: basePath}, projectConfig.templateConfig);

  if (!utils.isDir(pageDir)) {
    throw new Error(format('pagesDir %s is not a directory', pageDir));
  }

  var buildDir = path.join(basePath, projectConfig.buildDir);
  projectConfig.buildDir = buildDir;

  // Init the buildDir and the iframe dir.
  prepareBuildDir(buildDir);
  createIframeDir(buildDir);

  var pageList = getPageList(pageDir, buildDir, projectConfig);

  // Iterate over the pages.
  for (var i=0; i<pageList.length; i++) {
    var baseName = pageList[i].baseName;
    var pageContext = {
      html: pageList[i].html,
      title: pageList[i].heading,
      pageNav: pageList,
      enableFullScreen: true,
    };

    if (baseName !== 'index') {
      pageContext.activePage =  pageList[i].id;
    }

    pageContext = utils.defaults(pageContext,
                                 projectConfig.templateGlobals || {});

    var pageTemplate = 'cog-page.html';
    if (baseName === 'index') {
      pageTemplate = 'cog-index.html';
    }

    // Pass any context plus global context and render the page html
    var rendered = renderers.nunjucks(
      pageTemplate, pageContext, projectConfig.templateConfig);

    var builtPagePath = path.join(buildDir, baseName + '.html');
    fs.writeFileSync(builtPagePath, utils.prettyHTML(rendered));
  }

  // Copy all the cog static files into the build dir.
  fs.copySync(path.join(__dirname, '../static'), path.join(buildDir, 'cog'));

  // Copy other files into build dir
  if (projectConfig.copy && projectConfig.copy.length) {
    for (var j=0; j < projectConfig.copy.length; j++) {
      var map = projectConfig.copy[j];
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
