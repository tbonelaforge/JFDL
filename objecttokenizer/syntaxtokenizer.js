var ObjectTokenizer = require('./objecttokenizer.js');
var SyntaxToken     = require('./syntaxtoken.js');
var _               = require('underscore');

// Class
var SyntaxTokenizer = function(options) {
  options.TokenModel = SyntaxToken;
  ObjectTokenizer.call(this, options);
};

// Class Methods
_.extend(SyntaxTokenizer, ObjectTokenizer);

// Instance Methods
_.extend(SyntaxTokenizer.prototype, ObjectTokenizer.prototype, {

});

module.exports = SyntaxTokenizer;
