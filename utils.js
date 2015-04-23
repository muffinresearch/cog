var fs = require('fs');
var format = require('util').format;
var path = require('path');

var cheerio = require('cheerio');
var marked = require('marked');
var highlight = require('highlight.js');
var prettyHTML = require('js-beautify').html;

marked.setOptions({
  highlight: highlightFunc,
});

/**
* Returns a syntax highlighted string.
* @param {string} code
* @returns {string}
*/
function highlightFunc(code) {
  return highlight.highlightAuto(code).value;
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
  if (isFile(contentOrPath)) {
    return marked(fs.readFileSync(contentOrPath, {encoding: 'utf8'}));
  } else {
    return marked(contentOrPath);
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
  Object.keys(defaultObj).forEach(function(key) {
    if (typeof object[key] === 'undefined') {
      object[key] = defaultObj[key];
    }
  });
  return object;
}

/**
* Extracts the content within selector from HTML string provided.
* @param {string} html - the HTML string to extract the selector content from
* @param {string} selector - the selector to find the content to extract
* @returns {string}
*/
function getContentBySelector(html, selector) {
  return cheerio.load(html)(selector).html();
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
  }).replace(/^[ \t]*?$\r?\n/mg, '');
}


module.exports = {
  absolutify: absolutify,
  defaults: defaults,
  getContentBySelector: getContentBySelector,
  highlight: highlightFunc,
  isDir: isDir,
  isFile: isFile,
  prettyHTML: prettyHTML_,
  renderMarkdown: renderMarkdown,
};
