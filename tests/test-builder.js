'use strict';

var cog = require('../lib');
var utils = require('../lib/utils');

describe('cog.getConfig()', function(){

  it('should find the global docs config', function(){
    var conf = cog.getConfig(utils.absolutify('docs'));
    assert.equal(conf.templateGlobals.projectName, 'Cog Docs');
  });

  it('should provide defaults for undefined keys', function(){
    var config = {whatever: 'test'};
    var defaults = {'whatever': 'other', foo: 'bar'};
    var conf = cog.getConfig('docs', config, defaults);
    assert.equal(conf.whatever, 'test');
    assert.equal(conf.foo, 'bar');
  });

});


describe('cog.buildPages', function() {

  it('should throw error if pages dir isn\'t found', function() {
    assert.throws(function() {
      cog.buildPages('docs', {pageDir: 'whatever'});
    }, /is not a directory/);
  });

  it('should build pages without error', function() {
    assert.doesNotThrow(function() {
      cog.buildPages('docs');
    });
  });

});

describe('cog.cleanSync()', function() {

  it('should reject if you attempt to clean /', function() {
    assert.throws(function() {
      cog.cleanSync('/');
    }, 'buildDir cannot be /');
  });

  it('should reject if you attempt to clean above CWD', function() {
    assert.throws(function() {
      cog.cleanSync('/foo');
    }, 'buildDir must be under the CWD');
  });

  it('should show the top level files list when noop is true', function() {
    var files = cog.cleanSync(utils.absolutify('tests/test-clean'), true);
    assert.include(files, 'dir');
    assert.include(files, 'file.txt');
  });

});



