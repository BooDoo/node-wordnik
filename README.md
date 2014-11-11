# node-wordnik

A simple, Promise-based node.js client for the Wordnik API <http://developer.wordnik.com/>

Based on [node-wordnik](https://github.com/cpetzold/node-wordnik).

## Example

```javascript
// var APIKEY = process.env.WORDNIK_KEY
var Wordnik = require('wordnik-as-promised'),
    wn;

wn = new Wordnik(APIKEY);

wn.word('promise', {
  useCanonical: true,
  includeSuggestions: true
})
.tap(console.log)
.then(function(word) {
  return word.related({
    limitPerRelationShipType: 2
  });
)
.tap(console.log)
.then(function(groups) {
  // do something with these, maybe?
  return groups;
})
.catch(console.error);

wn.definitions('compliance').then(console.log, console.error);
```
