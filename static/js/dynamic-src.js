/* global document, window */

(function() {
  var body = document.body;
  var target = document.querySelector(
    body.getAttribute('data-source-selector')) || body;

  if (!body.getAttribute('data-dynamic-source')) {
    return;
  }

  var observer = new window.MutationObserver(function(mutations) {
    mutations.forEach(function() {
      window.parent.postMessage(target.innerHTML, window.location.origin);
    });
  });

  observer.observe(target, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
})();
