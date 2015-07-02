var nunjucks = require('nunjucks');
var path = require('path');

module.exports = {

  nunjucks: function(template, context, config) {
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
                         path.join(__dirname, '../templates')));
    var nunjucksConfig = config.nunjucksConfig || {};
    var env = new nunjucks.Environment(nunjucksLoaders, nunjucksConfig);
    return env.render(template, context);
  },

};
