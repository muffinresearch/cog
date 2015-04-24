module.exports = {
  // Break points determine the buttons created to allow the user
  // to change the resizable iframe to preset sizes.
  breakPoints: [
    {
      name: 'Trusted UI',
      icon: 'lock',
      w: 276,
      h: 384
    }, {
      name: 'Phone',
      icon: 'phone',
      w: 350,
      h: 598
    }, {
      name: 'Tablet',
      icon: 'phone',
      w: 600,
      h: 887
    }
  ],
  // Anything here is added to the context
  // assuming that key is not already defined.
  templateGlobals: {
    projectName: 'Cog Docs',
    appMedia: '/static',
  },
  templateConfig: {
    // Relative to the styleguide. In this case it's the docs dir.
    templatePaths: ['../example-src/templates', '../docs/templates'],
  },
  // This selector is used to narrow down what content is displayed as
  // sourcecode from the rendered content placed in the iframe.
  // Here we're setting it globally but it can be overriden
  // in the page-level config.
  sourcecodeSelector: 'main',
  // Detail content here to copy into the build dir.
  copy: [
    // src is relative to the styleguide project example.
    {src: '../example-src/css/', target: 'static/'},
    {src: '../example-src/CNAME', target: 'CNAME'}
  ]
};
