var _ = require('underscore');
var Production = require('./production.js');

function Grammar(grammarData) {
  this.symbols = null;
  this.hasTerminal = null;
  this.hasNonterminal = null;
  this.productionsFor = {};
  this.maxRHSLength = 0;
  this._productions = null;
  this._reductions = null;
  this._initialize(grammarData);
  this._analyzeProductions();
}

_.extend(Grammar, {
  newProduction : function(productionString) {
    return new Production(productionString);
  }
});

_.extend(Grammar.prototype, {

  getProduction : function(index) {
    return this._productions[index];
  },

  getProductions : function() {
    return this._productions;
  },

  getReduction : function(index) {
    return this._reductions[index];
  },

  index : function(production) {
    var i = null;

    for (i = 0; i < this._productions.length; i++) {
      if (this._productions[i].isEqual(production)) {
        return i;
      }
    }
  },

  _initialize : function(grammarData) {
    var self = this;
    self._productions = [];
    self._reductions = []
    _.each(grammarData, function(grammarDatum) {
      var productionString = grammarDatum.production;

      self._productions.push(new Production(productionString));
      self._reductions.push(grammarDatum.reduction);
    });
  },

  _analyzeProductions : function() {
    var self = this;

    self.symbols = {};
    self.hasTerminal = {};
    self.hasNonterminal = {};
    _.each(self._productions, function(production) {
      self._analyzeProduction(production);
      if (!self.productionsFor[production.lhs]) {
        self.productionsFor[production.lhs] = [];
      }
      self.productionsFor[production.lhs].push(production);
      if (production.rhs.length > self.maxRHSLength) {
        self.maxRHSLength = production.rhs.length;
      }
    });
  },

  _analyzeProduction : function(production) {
    var self    = this;
    var lhs     = production.lhs;
    var rhs     = production.rhs;
    var symbols = [lhs].concat(rhs);

    _.each(symbols, function(symbol) {
      self.symbols[symbol] = 1;
      if (!self.hasNonterminal[symbol]) {
        self.hasTerminal[symbol] = 1;
      }
      if (symbol === lhs) {
        self.hasNonterminal[lhs] = 1;
        delete self.hasTerminal[symbol];
      }
    });
  }
});

module.exports = Grammar;
