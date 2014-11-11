var path = require('path');

var Word = module.exports = function(api, o) {
  var self = this;
  this.api = api;

  this.obj = {};
  Object.keys(o).forEach(function(p) {
    self[p] = self.obj[p] = o[p];
  });
};

['examples', 'definitions', 'frequency', 'topExample', 'related', 'phrases', 'hyphenation', 'pronunciations', 'audio'].forEach(function(method) {
  Word.prototype[method] = function(params) {
    if (typeof params === 'undefined') {
      params = {};
    }
    return this.request(method, params);
  }
});

Word.prototype.request = function(route, params) {
  try {
    route = path.join(this.word, route);
  }
  catch (e) {
    console.error(e,"\nDifficulty forming route; forcing...");
    route = [this.word, route].join('/');
  }
  return this.api.request('word', route, params);
};

