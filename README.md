### Marionette Zombie Detector

Helps find zombie views in Marionette

#### Install

```shell
$ npm install marionette-zombie-detector
```

Install the zombie detector before you use any Marionette Views:

```js
require('marionette-zombie-detector').install(require('backbone.marionette'));
```

#### Watch for Zombies

Now, open your console and look for "Zombie Detected" information messages.

#### Quick Demo
Watch the console as zombies are detected:
![https://s3.amazonaws.com/f.cl.ly/items/1i291H3g1N0S083U1k28/Screen%20Recording%202015-09-08%20at%2010.12%20am.gif](https://s3.amazonaws.com/f.cl.ly/items/1i291H3g1N0S083U1k28/Screen%20Recording%202015-09-08%20at%2010.12%20am.gif)

#### Note

This code is not intended for production purposes, only for finding zombies during
development.

#### How does it work?
The zombie detector uses two methods of detection:

1. Monitor the `el` element on each Marionette View. When the `el` is detached from the DOM, it ensures that the corresponding View has been destroyed and logs a leak if it has not.

2. Tracks all EventTarget `addEventListener` and `removeEventListener` invocations and ensures that when the View is removed from the DOM, all the event listeners have been removed from the `el` element and all it's child elements. In other words, when the view's subtree is removed from the DOM, no event listeners remain on the detached subtree.

#### Licence

MIT
