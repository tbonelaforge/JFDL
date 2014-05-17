var ObjectTokenizer = require('../objecttokenizer/objecttokenizer.js');
var SyntaxParser = require('../syntaxparser.js');
var LRParserGenerator = require('../lrparsergenerator/lrparsergenerator.js');
var _ = require('underscore');

function makeConstructor(name, body, semantics) {
  var constructorFactory = new Function(
    "body",
    "return function " + name + "(options){ body.call(this, options); };"
  );
  var constructor = constructorFactory(body);

  _.extend(constructor.prototype, semantics);
  return constructor;
};

function defaultBody(options) {
  _.extend(this, options);
};

var DIRECTORY = __dirname;

var Schema = function Schema(options) {
  this._id = options.id;
  this._dependencies = options.dependencies;
  this._syntax = options.syntax;
  this._semantics = options.semantics;
  this._directory = options.directory || DIRECTORY;
  this._constructor = makeConstructor(
    this._id, 
    defaultBody, 
    this._semantics
  );
  this._parser = null;
};

_.extend(Schema, {
  setDirectory : function(directory) {
    DIRECTORY = directory;
  }
});

_.extend(Schema.prototype, {
  getDependencies : function() {
    return this._dependencies;
  },
  getSyntax : function() {
    return this._syntax;
  },
  getConstructor : function() {
    return this._constructor;
  },
  load : function(json, callback) {
    var validationErrors = {};
    var result = this._getParser().parse(json, validationErrors);

    if (_.keys(validationErrors).length) {
      return callback(validationErrors);
    }
    callback(null, result);
  },
  
  _getParser : function() {
    if (!this._parser) {
      this._parser = this._makeParser();
    }
    return this._parser;
  },
  
  _makeParser : function() {
    var stack = [this._id];
    var visited = {};
    var grammarData = [];
    var neighbor = null;
    var neighborSyntax = null;
    var neighborDependencies = null;

    while (stack.length) {
      var id = stack.pop();
      if (!visited[id]) {
        neighbor = this.getNeighbor(id);
        neighborSyntax = neighbor.getSyntax();
        neighborDependencies = neighbor.getDependencies();
        var syntaxParser = new SyntaxParser({
          startSymbol     : id,
          externalSymbols : neighborDependencies,
          schema          : this
        });
        Array.prototype.push.apply(grammarData, syntaxParser.parse(neighborSyntax));
        Array.prototype.push.apply(stack, neighborDependencies);
        visited[id] = true;
      }
    }
    var generator = new LRParserGenerator(grammarData);
    return generator.generate(ObjectTokenizer);
  },
  getNeighbor : function(id) {
    var filename = this._directory + '/' + id.toLowerCase();
    return require(filename)
  }
});

module.exports = Schema;
