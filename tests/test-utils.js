'use strict';

var path = require('path');
var utils = require('../utils');

describe('utils.getBaseDir()', function(){

  it('should return an absolute path', function(){
    // Tests are run from the project root.
    assert.equal(utils.absolutify('example'),
                 path.join(__dirname, '../example'));
  });

  it('should remove trailing slashes', function(){
    assert.equal(utils.absolutify('example/'),
                 path.join(__dirname, '../example'));
  });

});

describe('utils.isDir()', function(){

  it('should return true for a dir', function(){
    assert.ok(utils.isDir('example'));
  });

  it('should return false for a non-existent path', function(){
    assert.notOk(utils.isDir('whatever'));
  });

  it('should return false for a file', function(){
    assert.notOk(utils.isDir('.jshintrc'));
  });

  it('should throw original error if not ENOENT', function(){
    assert.throws(function() {
      utils.isDir({});
    }, TypeError);
  });

});

describe('utils.isFile()', function(){

  it('should return false for a dir', function(){
    assert.notOk(utils.isFile('example'));
  });

  it('should return false for a non-existent path', function(){
    assert.notOk(utils.isFile('whatever'));
  });

  it('should return true for a file', function(){
    assert.ok(utils.isFile('.jshintrc'));
  });

  it('should throw original error if not ENOENT', function(){
    assert.throws(function() {
      utils.isFile({});
    }, TypeError);
  });

});

describe('utils.renderMarkdown()', function(){

  it('should render markdown content as string', function(){
    assert.include(utils.renderMarkdown(null, '# hai'),
                   '<h1 id="hai">hai</h1>');
  });

  it('should render markdown content from path', function(){
    assert.include(utils.renderMarkdown('example/pages/buttons.md'),
                   '<h1 id="buttons-example">Buttons Example</h1>');
  });

});
