var LRParserGenerator = require('./lrparsergenerator/lrparsergenerator.js');
var Production        = require('./production.js');
var SyntaxTokenizer   = require('./objecttokenizer/syntaxtokenizer.js');
var ObjectTokenizer   = require('./objecttokenizer/objecttokenizer.js');
var _                 = require('underscore');
var SyntaxToken       = require('./objecttokenizer/syntaxtoken.js');

var DEFAULT_START_SYMBOL = 'START';

function getKeyPath(stack) {
  var path = [];

  _.each(stack, function(stackElement) {
    if (stackElement instanceof SyntaxToken) {
      if (stackElement.isKey()) {
        path.push(stackElement.getData());
      }
    }
  });
  return path;
}

var SyntaxParser = function SyntaxParser(options) {
  this._startSymbol = options.startSymbol || DEFAULT_START_SYMBOL;
  this._externalSymbols = options.externalSymbols || [];
  this._Module = options.Module;
  this._schema = options.schema;
  this._grammarData = this._getGrammarData();
  this._generator = new LRParserGenerator(this._grammarData);
  this._parser = this._generator.generate(SyntaxTokenizer);
  this._externalGrammarData = null;
  this._parser.beforeParse(this._initialize());
};

_.extend(SyntaxParser, {
  absorbPair : function() {
    return function _absorbPair(constituents) {
      var keyValuePairs = constituents[0];
      var pair = constituents[1];
      
      keyValuePairs[pair.key] = pair.value;
      return keyValuePairs;
    };
  },
    
  startKeyValuePairs : function() {
    return function _startKeyValuePairs(constituents) {
      var pair = constituents[0];
      var keyValuePairs = {};
      
      keyValuePairs[pair.key] = pair.value;
      return keyValuePairs;
    };
  },
    
  recordPair : function() {
    return function _recordPair(constituents) {
      var key = constituents[0].getData();
      var value = constituents[1];

      if (value.getData && typeof value.getData === 'function') {
        value = value.getData();
      }
      
      var pair = {
        key : key,
        value : value
      };
      return pair;
    };
  },
    
  extractData : function() {
    return function _extractData(constituents) {
      return constituents[0].getData();
    };
  },
    
  transitiveUp : function() {
      return function(constituents) {
        return constituents[0];
      };
  }
});

_.extend(SyntaxParser.prototype, {
  parse : function(object, errors) {
    if (!errors) {
      errors = {};
    }

    this._parser.parse(object, errors);
    if (_.keys(errors).length) {
      return null;
    }
    return this._externalGrammarData.reverse();
  },

  _initialize : function() {
    var self = this;

    return function initialize() {
      self._externalGrammarData = [];
    }
  },

  _getGrammarData : function() {
    var grammarData = [
      { 
        production : 'SYNTAX -> { PAIRS }',
        reduction : this._compressSyntax()
      },
      {
        production : 'PAIRS -> PAIRS PAIR',
        reduction : this._accumulatePairs()
      },
      {
        production : 'PAIRS -> PAIR',
        reduction : this._startPairs()
      },
      {
        production : 'PAIR -> key VALUE',
        reduction : this._compressPair()
      },
      {
        production : 'VALUE -> SYNTAX',
        reduction : this._syntaxAsValue()
      },
      {
        production : 'VALUE -> ATOM',
        reduction : this._atomAsValue()
      },
      {
        production : 'VALUE -> ' + this._startSymbol,
        reduction : this._nonterminalAsValue()
      },
      {
        production : 'ATOM -> string',
        reduction : this._stringAsAtom()
      },
      {
        production : 'ATOM -> number',
        reduction : this._numberAsAtom()
      },
      {
        production : 'ATOM -> boolean',
        reduction : this._booleanAsAtom()
      }
    ];
    return grammarData.concat(this._getExternalGrammarData());
  },

  _getExternalGrammarData : function() {
    var self = this;
    var externalGrammarData = [];
    
    _.each(self._externalSymbols, function(externalSymbol) {
      externalGrammarData.push({
        production : 'VALUE -> ' + externalSymbol,
        reduction : SyntaxParser.transitiveUp()
      });
    });
    return externalGrammarData;
  },

  _getConstructor : function(symbol) {
    if (this._startSymbol === symbol ||
        this._externalSymbols.indexOf(symbol) > -1) {

      return this._schema.getNeighbor(symbol).getConstructor();
    }
    return Object;
  },

  _compressSyntax : function() {
    var self = this;

    return function compressSyntax(constituents) {
      var path = getKeyPath(this.getStack());
      var productions = [];
      var prefix = null;
      var key = null;
      var shallowPrefix = null;

      path.unshift(self._startSymbol);
      prefix = path.join('.');
      productions.push({
        production : prefix + "PAIRS -> " + prefix + "PAIRS " + prefix + "PAIR",
        reduction : SyntaxParser.absorbPair()
      });
      productions.push({
        production : prefix + "PAIRS -> " + prefix + "PAIR",
        reduction : SyntaxParser.startKeyValuePairs()
      });

      key = path.pop();
      productions.push({
        production : prefix + " -> { " + prefix + "PAIRS }",
        reduction : self._constructObject(key)
      });
      if (path.length) {
        shallowPrefix = path.join('.');
        productions.push({
          production : shallowPrefix + "PAIR -> key_" + key + " " + prefix,
          reduction : SyntaxParser.recordPair()
        });
      }
      Array.prototype.push.apply(self._externalGrammarData, productions);
      return "SYNTAX";
    };
  },

  _accumulatePairs : function() {
    var self = this;

    return function accumulatePairs(constituents) {
      return "PAIRS";
    };
  },

  _startPairs : function() {
    var self = this;
    
    return function startPairs(constituents) {
      return "PAIRS";
    };
  },


  _compressPair : function() {
    var self = this;

    return function compressPair(constituents) {
      var key = constituents[0];
      var value = constituents[1];
      if (value.getData && typeof value.getData === 'function') {
        if (self._externalSymbols.indexOf(value.getData()) > -1) {
          var keyPath = getKeyPath(this.getStack());
          keyPath.unshift(self._startSymbol);
          lhs = keyPath.join('.') + "PAIR";
          rhs = "key_" + key.getData() + " " +  value.getData();
          production =  lhs + " -> " + rhs;
          self._externalGrammarData.push({
            production : production,
            reduction : SyntaxParser.recordPair()
      });
        } else {
          throw new Error("Caint do dat");
        }
      }
      return "PAIR";
    };
  },

  _syntaxAsValue : function() {
    var self = this;

    return function syntaxAsValue(constituents) {
      return "VALUE";
    };
  },

  _atomAsValue : function() {
    var self = this;

    return function atomAsValue(constituents) {
      var atom = constituents[0];
      var keyPath = getKeyPath(this.getStack());
      var key = null;
      var lhs = null;
      var rhs = null;
      var production = null;
      
      keyPath.unshift(self._startSymbol);
      key = keyPath.pop();
      lhs = keyPath.join('.') + "PAIR";
      rhs = "key_" + key + " " +  atom.getData();
      production =  lhs + " -> " + rhs;
      self._externalGrammarData.push({
        production : production,
        reduction : SyntaxParser.recordPair()
      });
      return "VALUE";
    };
  },
    
  _stringAsAtom : function() {
    var self = this;

    return function stringAsAtom(constituents) {
      var token = constituents[0];
      
      return token;
    };
  },

  _numberAsAtom : function() {
    var self = this;

    return function numberAsAtom(constituents) {
      var token = constituents[0];
      
      return token;
    };
  },

  _booleanAsAtom : function() {
    var self = this;

    return function booleanAsAtom(constituents) {
      var token = constituents[0];
      
      return token;
    };
  },

  _nonterminalAsValue : function() {
    var self = this;

    return function nonterminalAsValue(constituents) {
      var nonterminal = constituents[0].getData();
      var path        = getKeyPath(this.getStack());
      var key         = null;
      var lhs         = null;
      var rhs         = null;

      path.unshift(self._startSymbol);
      key = path.pop();
      lhs = path.join('.') + "PAIR";
      rhs = 'key_' + key + " " + nonterminal;

      self._externalGrammarData.push({
        production : lhs + " -> " + rhs,
        reduction : SyntaxParser.recordPair()
      });
      return constituents[0];
    };
  },

  _constructObject : function(key) {
    var self = this;

    return function constructObject(constituents) {
      var leftBrace     = constituents[0];
      var keyValuePairs = constituents[1];
      var rightBrace    = constituents[2];
      var Constructor = self._getConstructor(key);

      return new Constructor(keyValuePairs);
    };
  },

});

module.exports = SyntaxParser;

