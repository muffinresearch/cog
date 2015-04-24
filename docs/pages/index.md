# Documentation

This is a quick demo of what's possible with cog.

This styleguide both provides examples with its own local templates and also
refers to a set of templates in an external directory.

The idea being that you can have both examples that you build in the styleguide
with smaller bits of code, e.g. typography and buttons and you can also
directly render existing view templates and just specify your own context.

## Markdown Pages

This page content is written with markdown. So it's super easy to add whatever
documentation you need to support the styleguide examples.

Other code examples can be provided using Github flavoured Markdown (GFM).

```javascript
function test(arg) {
  console.log(arg);
}
```

## The Index Page

This page is the index page so it doesn't typically come with anything other than
rendered markdown.

## Key Concepts

Here's some details on the key concepts to make it possible to layout a static styleguide.

### Pages

Pages are the mainstay of the styleguide. A page represents the page of the styleguide.
This page can contain purely documentation, in which case you just need a single file of
GFM.

### Iframe Content

To show an example in the styleguide you can provide templates and those are rendered
and included in the page as a resizable iframe. The iframe means the page style and behaviour
can't alter the iframe's look and feel. Also this gives us a way to provide a resizeable
container that allows us to see the content at different breakpoints. Which are all
confgurable too.

### Everything is Configurable

Generally everything is configurable. More specific config should override the global defaults or
project-level conf. Should you find that's not the case it's probably a bug.


### Building with grunt

It's very simple. Here's an example Gruntfile.js snippet:

```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    // Styleguide builder task.
    'cog': {
      // This builds from a directoyr
      'basic': {
        src: 'tests/grunt-examples/basic',
      },
      // Options can take the place of the config.js file.
      'basicopts': {
        src: 'tests/grunt-examples/basic',
        options: {
          templateGlobals: {
            'projectName': 'Basic Options',
          }
        }
      }
    }
  });
  grunt.loadTasks('cog');
};
```

Then run `grunt cog` to run all the task or run a single task e.g. `grunt cog:basic`

### Kicking the tyres and filing bugs.

This project is at an early stage. It's been built to replace a more dynamic styleguide. As it's used there
we'll iron out the kinks as we find them. That said if you're interested in trying it out please do.

If you find something that doesn't work as expected [please file a bug](https://github.com/muffinresearch/cog/issues/new).



