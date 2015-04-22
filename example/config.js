module.exports = {
  // pages of content.
  // pageDir: './pages-dir',  (defaults to ./pages);

  // Template directory for content to be displayed in iframes/
  contentTemplateDir: '../example-src/templates',
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
  globals: {
    projectName: 'Cog Example',
  }
};
