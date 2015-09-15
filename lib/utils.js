var fs = require('fs');
var format = require('util').format;
var path = require('path');

var cheerio = require('cheerio');
var hljs = require('highlight.js');
var prettyHTML = require('js-beautify').html;

var md = require('markdown-it')({
  html: true,
  linkify: true,
  highlight: highlightFunc,
});

md.renderer.rules.table_open  = function () {
  return '<table class="table table-striped">';
};

/**
* Returns a syntax highlighted string.
* @param {string} code
* @returns {string}
*/
function highlightFunc(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (__) {}
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (__) {}

  return ''; // use external default escaping
}

/**
* If path is a directory returns true.
* @param {string} path_
* @returns {boolean}
*/
function isDir(path_) {
  try {
    return fs.lstatSync(path_).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else  {
      throw e;
    }
  }
}

/**
* If path is a file returns true.
* @param {string} path_
* @returns {boolean}
*/
function isFile(path_) {
  try {
    return fs.lstatSync(path_).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else  {
      throw e;
    }
  }
}

/**
* Provides an absolute path based on basePath and CWD.
* @param {string} basePath
* @returns {string}
*/
function absolutify(basePath) {
  // Normalize and remove trailing slash.
  if (!basePath) {
    throw new Error('basePath is required');
  }
  basePath = path.join(process.cwd(), './' + basePath.replace(/\/$/, ''));
  if (!isDir(basePath)) {
    throw new Error(format('basePath: %s is not a directory', basePath));
  }
  return basePath;
}

/**
* Renders markdown to HTML
* @param {string} contentOrPath - if path exists file is read and
* rendered otherwise the string is directly rendered.
* @returns {string}
*/
function renderMarkdown(contentOrPath) {
  if (contentOrPath.length < 1024 && isFile(contentOrPath)) {
    return md.render(fs.readFileSync(contentOrPath, {encoding: 'utf8'}));
  } else {
    return md.render(contentOrPath);
  }
}

/**
* Populates an object with defaults if the key is not yet defined.
* Similar to _.defaults except this takes only a single defaults object.
* @param {object} object - the object to populate defaults on
* @param {object} defaults - the defaults to use
* @returns {object}
*/
function defaults(object, defaultObj) {
  object = object || {};
  defaultObj = defaultObj || {};
  Object.keys(defaultObj).forEach(function(key) {
    if (typeof object[key] === 'undefined') {
      object[key] = defaultObj[key];
    }
  });
  return object;
}

/**
* Extracts the content within selector from HTML string provided.
* @param {string} html - an HTML string
* @param {string} selector - the selector to extract HTML from
* @returns {string}
*/
function getContentBySelector(html, selector) {
  if (!selector) {
    return html;
  }
  var snippet = cheerio.load(html)(selector).html();
  if (!snippet) {
    return html;
  }
  return snippet;
}

/**
* Extracts the text within selector from HTML string provided.
* @param {string} html - a string of HTML
* @param {string} selector - the selector to extract text from/
* @returns {string}
*/
function getTextBySelector(html, selector) {
  if (!selector) {
    return html;
  }
  var snippet = cheerio.load(html)(selector).text();
  if (!snippet) {
    return html;
  }
  return snippet;
}


/**
* Prettifies HTML.
* @param {string} html - the HTML string to prettify
* @returns {string}
*/
function prettyHTML_(html) {
  return prettyHTML(html, {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    preserve_newlines: false,
  });//.replace(/^[ \t]*?$\r?\n/mg, '');
}


/**
* Noddy text to identifier conversion.
* @param {string} text - the text to make into an id.
* @returns {string}
*/
function textToId(text) {
  return text.toLowerCase().replace(' ', '-');
}

/**
* Creates list of breakPoints augmenting with ids.
* @param {array} breakpointList - list of break points to update.
* @returns {array}
*/
function getBreakPointConf(breakpointList) {
  for (var i=0; i < breakpointList.length; i++) {
    var currentObj = breakpointList[i];
    currentObj.id = textToId(currentObj.name);
  }
  return breakpointList;
}


module.exports = {
  absolutify: absolutify,
  defaults: defaults,
  getBreakPointConf: getBreakPointConf,
  getContentBySelector: getContentBySelector,
  getTextBySelector: getTextBySelector,
  highlight: highlightFunc,
  isDir: isDir,
  isFile: isFile,
  prettyHTML: prettyHTML_,
  renderMarkdown: renderMarkdown,
  textToId: textToId,
};
