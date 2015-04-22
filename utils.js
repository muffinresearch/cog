var fs = require('fs');
var format = require('util').format;
var path = require('path');

var marked = require('marked');


function isDir(path) {
  try {
    return fs.lstatSync(path).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else  {
      throw e;
    }
  }
}


function isFile(path) {
  try {
    return fs.lstatSync(path).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else  {
      throw e;
    }
  }
}


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


function renderMarkdown(contentPath, content) {
  return marked(content || fs.readFileSync(contentPath, {encoding: 'utf8'}));
}


module.exports = {
  absolutify: absolutify,
  isDir: isDir,
  isFile: isFile,
  renderMarkdown: renderMarkdown,
};
