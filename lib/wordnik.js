var _ = require('lodash'),
    rest = require('rest'),
    mime = require('rest/interceptor/mime'),
    pathPrefix = require('rest/interceptor/pathPrefix'),
    qs = require('querystring'),
    path = require('path'),
    Word = require('./word');

var Wordnik = module.exports = function init(options) {
  if (typeof options === 'string') {
    options = {api_key: options};
  }
  this.options = options || {};
  this.options.host = this.options.host || 'api.wordnik.com';
  this.options.version = this.options.version || 'v4';
  this.options.format = this.options.format || 'json';

  this.client = pathPrefix(mime(), {prefix: 'http://api.wordnik.com/' + this.options.version});
  if (!this.options.api_key) throw new Error('Wordnik api requires a valid api key');
};

Wordnik.prototype.word = function(word, params) {
  var self = this;

  if (typeof params === 'undefined') {
    params = {};
  }

  return this.request('word', word, params)
    .then(function(res) {
      return new Word(self, res);
    });
};

['examples', 'definitions', 'frequency', 'topExample', 'related', 'phrases', 'hyphenation', 'pronunciations', 'audio'].forEach(function(method) {
  Wordnik.prototype[method] = function(word, params) {
    if (typeof params === 'undefined') {
      params = {};
    }

    var word = new Word(this, { word: word });
    return word[method](params);
  };
});

Wordnik.prototype.search = function(query, params) {
  if (typeof params === 'undefined') {
    params = {};
  }

  var route = path.join('search', query);

  // TODO: maybe return an array of Word objects as well?
  return this.request('words', route, params);
};

['randomWord', 'randomWords', 'wordOfTheDay'].forEach(function(method) {
  Wordnik.prototype[method] = function(params) {
    if (typeof params === 'undefined') {
      params = {};
    }

    return this.request('words', method, params);
  };
});

Wordnik.prototype.authenticate = function(username, password, params) {
  if (typeof params === 'undefined') {
    params = {};
  }

  var route = path.join('authenticate', username);
  params.password = password;

  return this.request('account', route, params);
};

Wordnik.prototype.apiTokenStatus =
Wordnik.prototype.status = function(params) {
  if (typeof params == 'undefined') {
    params = {};
  }

  return this.request('account', 'apiTokenStatus', params);
};

['user', 'wordLists'].forEach(function(method) {
  Wordnik.prototype[method] = function(token, params) {
    if (typeof params === 'undefined') {
      params = {};
    }

    params.auth_token = token;

    return this.request('account', method, params);
  };
});



Wordnik.prototype.request = function(section, route, params, options) {
  if (typeof params === 'undefined') {
    params = {};
    options = {};
  } else if (typeof options === 'undefined') {
    options = {};
  } else {
    options = options || {};
  }

  // options.host = this.options.host;
  options.headers = options.headers || {};
  options.method = options.method ? options.method.toLowerCase() : 'get';

  params.api_key = this.options.api_key;
  params = qs.stringify(params);

  var fullPath = path.join(section + '.' +  this.options.format, route);
  route = path.join(section + '.' +  this.options.format, route);

  if (options.method == 'get') {
    route += '?' + params;
  } else if (options.method == 'post') {
    options.entity = options.entity || options.body;
  }
  _.assign(options);

  //console.log(route, params);
  return this.client(route, options).then(function(res) {return res.entity});
}

