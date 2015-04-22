'use strict';

var cog = require('../index');
var utils = require('../utils');

describe('cog.getConfig()', function(){

  it('should find the global example config', function(){
    var conf = cog.getConfig(utils.absolutify('example'));
    assert.equal(conf.globals.projectName, 'Cog Example');
  });

  it('should provide defaults for undefined keys', function(){
    var config = {whatever: 'test'};
    var defaults = {'whatever': 'other', foo: 'bar'};
    var conf = cog.getConfig('example', config, defaults);
    assert.equal(conf.whatever, 'test');
    assert.equal(conf.foo, 'bar');
  });

});


describe('cog.buildPages', function() {

  it('should throw error if pages dir isn\'t found', function() {
    assert.throws(function() {
      cog.buildPages('example', {pageDir: 'whatever'});
    }, /is not a directory/);
  });

});

describe('cog.clean()', function() {

  it('should reject if you attempt to clean /', function(done) {
    cog.clean('/')
      .then(function() {
        assert.fail();
      }).catch(function(err) {
        assert.equal(err.toString(), 'Error: buildDir cannot be /');
        done();
      }).catch(done);
  });

  it('should reject if you attempt to clean above CWD', function(done) {
    cog.clean('/foo')
      .then(function() {
        assert.fail();
      }).catch(function(err) {
        assert.equal(err.toString(), 'Error: buildDir must be under the CWD');
        done();
      }).catch(done);
  });

  it('should show the top level files list when noop is true', function(done) {
    cog.clean(utils.absolutify('tests/test-clean'), true)
      .then(function(files) {
        assert.include(files, 'dir');
        assert.include(files, 'file.txt');
        done();
      }).catch(done);
  });

});
