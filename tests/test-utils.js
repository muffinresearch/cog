'use strict';

var path = require('path');
var utils = require('../utils');


describe('utils.highlight()', function(){

  it('should return highlighted HTML', function(){
    var highlighted = utils.highlight('<div><p>test</p></div>');
    assert.include(highlighted, 'hljs-tag');
    assert.include(highlighted, 'hljs-title');
  });

});

describe('utils.textToId()', function(){

  it('should convert test to id', function(){
    assert.equal(utils.textToId('Example text'), 'example-text');
  });

  it('should leave things unchanged', function(){
    assert.equal(utils.textToId('already-done'), 'already-done');
  });

});


describe('utils.getContentBySelector()', function(){

  it('should extract a span', function(){
    assert.equal(utils.getContentBySelector(
      '<div><p><span>foo</span></p></div>', 'p'), '<span>foo</span>');
  });

});


describe('utils.getTextBySelector()', function(){

  it('should extract the text from a selector', function(){
    assert.equal(utils.getTextBySelector(
      '<div><h1>foo</h1></div>', 'h1'), 'foo');
  });

});


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
    assert.include(utils.renderMarkdown('# hai'),
                   '<h1 id="hai">hai</h1>');
  });

  it('should render markdown content from path', function(){
    assert.include(utils.renderMarkdown('example/pages/buttons.md'),
                   '<h1 id="buttons-example">Buttons Example</h1>');
  });

});


describe('utils.defaults()', function() {

  it('should handle merging defaults into object', function() {
    var obj = {
      bar: false,
      foo: 'something',
    };
    var defaults  = {
      bar: true,
      newKey: 'new-thing'
    };
    var result = utils.defaults(obj, defaults);
    assert.deepEqual(result, {
      bar: false,
      foo: 'something',
      newKey: 'new-thing',
    });
  });

  it('should handle merging defaults into empty object', function() {
    var obj = {};
    var defaults  = {
      bar: true,
      newKey: 'new-thing'
    };
    var result = utils.defaults(obj, defaults);
    assert.deepEqual(result, {
      bar: true,
      newKey: 'new-thing',
    });
  });

  it('should not override existing props', function() {
    var obj  = {
      bar: true,
      newKey: 'new-thing'
    };
    var defaults  = {
      bar: false,
      newKey: 'other-thing'
    };
    var result = utils.defaults(obj, defaults);
    assert.deepEqual(result, {
      bar: true,
      newKey: 'new-thing',
    });
  });

  it('should not override null', function() {
    var obj  = {
      bar: null,
      newKey: 'new-thing'
    };
    var defaults  = {
      bar: false,
      newKey: 'other-thing'
    };
    var result = utils.defaults(obj, defaults);
    assert.deepEqual(result, {
      bar: null,
      newKey: 'new-thing',
    });
  });

  it('should override an undefined property', function() {
    var obj  = {
      bar: undefined,
    };
    var defaults  = {
      bar: false,
    };
    var result = utils.defaults(obj, defaults);
    assert.deepEqual(result, {
      bar: false,
    });
  });

  it('should handle the object being undefined', function() {
    var defaults  = {
      bar: 'result',
    };
    var result = utils.defaults(undefined, defaults);
    assert.deepEqual(result, {
      bar: 'result',
    });
  });
});

