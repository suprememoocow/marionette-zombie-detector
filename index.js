'use strict';

function isAttachedToDocument(el) {
  for(var parentElement = el.parentElement; parentElement; parentElement = parentElement.parentElement) {
    if (parentElement === document.documentElement) return true;
  }

  return false;
}

function onRemoved() {
  var view = this;

  requestAnimationFrame(function() {
    if (isAttachedToDocument(view.el)) return; // Reattached.

    if (!view._leakWatch) return;
    view.el.removeEventListener('DOMNodeRemovedFromDocument', view._leakWatch, false);
    view._leakWatch = null;

    if (!view.isDestroyed) {
      console.log('Zombie detected', view);
    }
  });
}

module.exports = {
  install: function(Marionette) {
    var ViewConstructor = Marionette.View;
    var ViewPrototype = Marionette.View.prototype;
    Marionette.View = function() {
      ViewConstructor.apply(this, arguments);
      this._leakWatch = onRemoved.bind(this);
      this.el.addEventListener('DOMNodeRemovedFromDocument', this._leakWatch, false);
    };
    Marionette.View.prototype = ViewPrototype;
  }
};
