var Grammar          = require('../grammar.js');
var LRParser         = require('../lrparser.js');
var ShiftTransition  = require('../transition/shifttransition.js');
var ReduceTransition = require('../transition/reducetransition.js');
var GotoTransition   = require('../transition/gototransition.js');
var ItemSet          = require('./itemset.js');
var Item             = require('./item.js');
var util             = require('./util.js');
var _                = require('underscore');

var EOFSYMBOL = 'eof';

var LRParserGenerator = function(grammarData) {
  this._grammar = this._makeAugmentedGrammar(grammarData);
  this._firsts = this._computeFirsts();
  this._followers = this._computeFollowers();
  this._transitionTable = null;
  this._itemsetIndices = null;
  this._acceptingState = null;
};

_.extend(LRParserGenerator.prototype, {
  
  generate : function(tokenizer) {
    var initialItemset = this._createInitialItemset();
    var currentItemset = null;

    this._itemsetIndices = {};
    this._transitionTable = [];
    this._addItemset(initialItemset);
    this._unprocessedItemsets = [initialItemset];
    while (this._unprocessedItemsets.length) {
      currentItemset = this._unprocessedItemsets.shift();
      this._processItemset(currentItemset);
    }
    return new LRParser({
      grammar        : this._grammar,
      table          : this._transitionTable,
      acceptingState : this._acceptingState,
      tokenizer      : tokenizer
    });
  },

  _makeAugmentedGrammar : function(grammarData) {
    var firstProduction     = grammarData[0].production;
    var mainProduction      = Grammar.newProduction(firstProduction);
    var startSymbol         = mainProduction.lhs;
    var augmentedProduction = "PHI -> " + startSymbol + " " + EOFSYMBOL;

    grammarData.unshift({
      production : augmentedProduction
    });
    var newGrammar = new Grammar(grammarData);
    return newGrammar;
  },

  _processItemset : function(itemset) {
    this._makeAllSymbolTransitions(itemset);
    this._addAllReductions(itemset);
  },

  _makeAllSymbolTransitions : function(itemset) {
    var self = this;

    _.each(itemset.readyFor, function(items, symbol) {
      var newItemset = self._makeSymbolTransition(itemset, symbol);

      if (newItemset) {
        self._unprocessedItemsets.push(newItemset);
      }
    });
  },

  _addAllReductions : function(itemset) {
    var self  = this;
    var state = self._indexItemset(itemset);

    _.each(itemset.completeItems, function(completeItem) {
      self._addReductions(state, completeItem);
    });
  },

  _makeSymbolTransition : function(itemset, symbol) {
    var transition      = null;
    var state           = this._indexItemset(itemset);
    var proposedItemset = this._advanceItemset(itemset, symbol);
    var isNew           = !this._containsItemset(proposedItemset);
    var newState        = this._indexItemset(proposedItemset);

    if (this._grammar.hasTerminal[symbol]) {
      transition = new ShiftTransition(newState);
    } else { // Symbol is nonterminal
      transition = new GotoTransition(newState);
    }

    this._installTransition(state, symbol, transition);
    if (isNew) {
      return proposedItemset;
    } else {
      return null;
    }
  },

  _addReductions : function(state, item) {
    var self = this;
    var productionNumber = self._indexProduction(item.production);
    var reduction = new ReduceTransition(productionNumber);

    _.each(_.keys(self._followers[item.production.lhs]), function(symbol) {
      self._installTransition(state, symbol, reduction);
    });
  },

  _createInitialItemset : function() {
    var initialItemset = new ItemSet({
      grammar : this._grammar
    });
    
    initialItemset.addItem(new Item({
      grammar    : this._grammar,
      production : this._grammar.getProduction(0),
      position   : 0
    }));
    initialItemset.computeClosure();
    return initialItemset;
  },

  _advanceItemset : function(itemset, symbol) {
    var advancedItemset = new ItemSet({
      grammar : this._grammar
    });

    _.each(itemset.readyFor[symbol], function(item) {
      var advancedItem = item.advance();
      advancedItemset.addItem(item.advance());
    });
    advancedItemset.computeClosure();
    return advancedItemset;
  },

  _indexItemset : function(itemset) {
    if (this._containsItemset(itemset)) {
      return this._itemsetIndices[itemset.key];
    }
    return this._addItemset(itemset);
  },

  _indexProduction : function(production) {
    return this._grammar.index(production);
  },

  _installTransition : function(state, symbol, transition) {
    if (this._transitionTable[state][symbol]) {
      throw new Error("Ambiguous grammar"); 
    }
    if (symbol === EOFSYMBOL && transition.isShift()) {
      this._acceptingState = transition.state;
    }
    this._transitionTable[state][symbol] = transition;
  },

  _containsItemset : function(itemset) {
    if (this._itemsetIndices[itemset.key] !== undefined) {
      return true;
    }
    return false;
  },
  
  _addItemset : function(itemset) {
    var newItemsetIndex = this._transitionTable.length;

    this._transitionTable.push({});
    this._itemsetIndices[itemset.key] = newItemsetIndex;
    return newItemsetIndex;
  },

  _computeFirsts : function() {
    var self = this;
    var changed = null;
    var firsts = self._initializeFirsts();

    changed = true;
    while (changed) {
      changed = false;
      _.each(self._grammar.getProductions(), function(production) {
        var lhs = production.lhs;
        var leftCorner = production.rhs[0];
        if (util.installKeys({
          source : firsts[leftCorner],
          target : firsts[lhs]
        }) > 0) {
          changed = true;
        }
      });
    }
    return firsts;
  },

  _computeFollowers : function() {
    var self = this;
    var changed = null;
    var followers = self._initializeFollowers();

    changed = true;
    while (changed) {
      changed = false;
      _.each(self._grammar.getProductions(), function(production) {
        if (self._installFollowersByProduction(followers, production)) {
          changed = true;
        }
      });
    }
    return followers;
  },

  _installFollowersByProduction : function(followers, production) {
    var changed = false;

    if (this._installRHSFollowers(followers, production)) {
      changed = true;
    }
    if (this._installLHSFollowers(followers, production)) {
      changed = true;
    }
    return changed;
  },

  _installRHSFollowers : function(followers, production) {
    var changed     = false;
    var i           = null;
    var leftSymbol  = null;
    var rightSymbol = null;

    for (i = 1; i < production.rhs.length; i++) {
      leftSymbol = production.rhs[i - 1];
      rightSymbol = production.rhs[i];
      if (this._grammar.hasNonterminal[leftSymbol]) {
        if (util.installKeys({
          source : this._firsts[rightSymbol], 
          target : followers[leftSymbol]
        }) > 0) {
          changed = true;
        }
      }
    }
    return changed;
  },

  _installLHSFollowers : function(followers, production) {
    var lhs     = production.lhs;
    var rhs     = production.rhs;
    var rhsTail = rhs[rhs.length - 1];
    var changed = false;

    if (this._grammar.hasNonterminal[rhsTail]) {
      if (util.installKeys({
        source : followers[lhs],
        target : followers[rhsTail]
      }) > 0) {
        changed = true;
      }
    }
    return changed;
  },

  _initializeFirsts : function() {
    var self = this;
    var firsts = {};
    var grammarSymbols = _.keys(self._grammar.symbols);

    _.each(grammarSymbols, function(symbol) {
      firsts[symbol] = {};
      if (self._grammar.hasTerminal[symbol]) {
        firsts[symbol][symbol] = 1; // Terminals are firsts for themselves.
      }
    });
    return firsts;
  },

  _initializeFollowers : function() {
    var self = this;
    var followers = {};
    var nonterminals = _.keys(self._grammar.hasNonterminal);

    _.each(nonterminals, function(nonterminal) {
      followers[nonterminal] = {};
    });
    return followers;
  }

});



module.exports = LRParserGenerator;
