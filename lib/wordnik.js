var http = require('http')
  , qs = require('querystring')
  , path = require('path')
  , Word = require('./word');

var Wordnik = module.exports = function(options) {
  this.options = options || {};
  
  this.options.host = this.options.host || 'api.wordnik.com';
  this.options.version = this.options.version || 'v4';
  this.options.format = this.options.format || 'json';
  
  if (!this.options.api_key) throw new Error('Wordnik api requires a valid api key');
};

Wordnik.prototype.word = function(word, params, fn) {
  var self = this;
  
  if (typeof params == 'function') {
    fn = params;
    params = {};
  }
  
  this.request('word', word, params, function(e, res) {
    if (e) {
      fn(e);
    } else {
      fn(null, new Word(self, res), res);
    }
  });
};

['examples', 'definitions', 'frequency', 'topExample', 'related', 'phrases', 'hyphenation', 'pronunciations', 'audio'].forEach(function(method) {
  Wordnik.prototype[method] = function(word, params, fn) {
    if (typeof params == 'function') {
      fn = params;
      params = {};
    }
    
    var word = new Word(this, { word: word });
    word[method](params, fn);
  }
});

Wordnik.prototype.request = function(section, route, params, options, fn) {
  if (typeof params == 'function') {
    fn = params;
    params = {};
    options = {};
  } else if (typeof options == 'function') {
    fn = options;
    options = {};
  } else {
    options = options || {};
  }
  
  options.headers = options.headers || {};
  options.method = options.method ? options.method.toLowerCase() : 'get';
  
  params.api_key = this.options.api_key;
  params = qs.stringify(params);
  
  route = '/' + path.join(this.options.version, section + '.' +  this.options.format, route);
  
  if (options.method == 'get') {
    route += '?' + params;
  } else if (options.method == 'post') {
    options.headers['content-type'] = 'application/x-www-form-urlencoded';
    options.headers['content-length'] = params.length;
  }
  
  
  var req = http.request({
      host: this.options.host
    , port: 80
    , path: route
    , method: options.method
    , headers: options.headers
  }, function(res) {
    var result = '';
    res.on('data', function(chunk) {
      result += chunk;
    });
    res.on('end', function() {
      result = JSON.parse(result);
      if (result.code >= 400) {
        result.error.code = result.code;
        return fn(result.error, null, res.headers, res.statusCode);
      }
      return fn(null, result, res.headers, res.statusCode);
    });
    res.on('error', function(e) {
      return fn(e, null, res.headers, res.statusCode);
    });
  });
  
  req.on('error', function(e) {
    return fn(e);
  });
  
  if (options.method == 'post') {
    req.write(params);
  }
  
  req.end();
};
