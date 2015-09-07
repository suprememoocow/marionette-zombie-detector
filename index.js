function isAttachedToDocument(el) {
  for(var parentElement = el.parentElement; parentElement; parentElement = parentElement.parentElement) {
    if (parentElement === document.documentElement) return true;
  }

  return false;
}

function findZombieEvents(view) {
  var nodeIterator = document.createNodeIterator(view.el, NodeFilter.SHOW_ELEMENT);

  if (view.el._debugEventListeners && view.el._debugEventListeners.length) {
    console.log('Zombie listeners detected', view, view.el._debugEventListeners);
  }

  var currentNode;
  while ((currentNode = nodeIterator.nextNode())) {
    if (currentNode._debugEventListeners && currentNode._debugEventListeners.length) {
      console.log('Zombie listeners detected', view, currentNode._debugEventListeners);
    }
  }
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
    } else {
      findZombieEvents(view);
    }
  });
}

function indexOfListener(el, type, fn, capture) {
  if (!el._debugEventListeners) return -1;
  for (var i = 0; i < el._debugEventListeners.length; i++) {
      var item = el._debugEventListeners[i];
      if (item.type === type && item.fn === fn && item.capture === capture) {
        return i;
      }
  }
  return -1;
}

function installEventTargetListeners() {
  var addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, capture) {
    var i = indexOfListener(this, type, fn, capture);
    if (i === -1) {
      if (!this._debugEventListeners) {
      	this._debugEventListeners = [];
    	}
	    this._debugEventListeners.push({ type: type, fn: fn, capture: capture});
    }

    return addEventListener.apply(this, arguments);
  }

  var removeEventListener = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.removeEventListener = function(type, fn, capture) {
    var i = indexOfListener(this, type, fn, capture);
    if (i >= 0) {
      this._debugEventListeners.splice(i, 1);
    }
    return removeEventListener.apply(this, arguments);
  }
}

module.exports = {
  install: function(Marionette) {
    installEventTargetListeners();

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
