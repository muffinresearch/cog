# HTML content

Using raw html in the code fence this example shows how you can use HTML directly
and have it renderered to an iframe, with the option to add styles or scripts
via the YAML front matter.

```iframe
---
sourcecodeSelector: body
title: This is YFM
styles:
  - app.css
---

<h2>Buttons</h2>
<button class="btn btn-block">Default Button</button>
<button class="btn btn-block" disabled>Default Button (disabled)</button>
<button class="btn btn-success btn-block">Call To Action</button>
<button class="btn btn-success btn-block" disabled>Call To Action (disabled)</button>
```
