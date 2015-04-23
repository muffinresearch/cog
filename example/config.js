module.exports = {
  // Break points determin the resizable iframe size.
  breakPoints: [
    {
      name: 'trusted-ui',
      x: 276,
      y: 384
    }, {
      name: 'desktop',
      x: 1024,
      y: 768
    }
  ],
  // Anything here is added to the context
  // assuming that key is not already defined.
  templateGlobals: {
    projectName: 'Cog Example',
    appMedia: '/static',
  },
  templateConfig: {
    // Relative to the styleguide. In this case it's the example dir.
    templatePaths: ['../example-src/templates', '../example/templates'],
  },
  // This selector is used to narrow down what content is displayed as
  // sourcecode from the rendered content placed in the iframe.
  // Here we're setting it globally but it can be overriden
  // in the page-level config.
  sourcecodeSelector: 'main',
  // Detail content here to copy into the build dir.
  copy: [
    // src is relative to the styleguide project example.
    {src: '../example-src/css/', target: 'static/'}
  ]
};
