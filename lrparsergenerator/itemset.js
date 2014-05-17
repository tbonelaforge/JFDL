var _ = require('underscore');
var Item = require('./item.js');

var ItemSet = function(options) {
  this.key = null;
  this._grammar = options.grammar;
  this._itemsByKey = {};
  this._stack = [];
  this.completeItems = [];
  this.readyFor = {};
}

_.extend(ItemSet.prototype, {

  addItem : function(item) {
    if (!this._itemsByKey[item.key]) {
      this._itemsByKey[item.key] = item;
      if (item.isComplete()) {
        this.completeItems.push(item);
      } else {
        this._addReadyForItem(item);
      }
    }
  },

  hasItem : function(item) {
    return (this._itemsByKey[item.key]) ? true : false;
  },

  newItem : function(production) {
    return new Item({
      grammar    : this._grammar,
      production : production,
      position   : 0
    });
  },

  computeClosure : function() {
    this._stack = _.values(this._itemsByKey);
    var item = null;
    var symbol = null;

    while (this._stack.length) {
      item = this._stack.shift();
      symbol = item.getSymbol();
      if (this._grammar.hasNonterminal[symbol]) {
        this._addPredictedItems(symbol);
      }
    }
    this.key = this._computeKey();
    return this.key;
  },

  _addPredictedItems : function(symbol) {
    var self = this;

    var productions = self._grammar.productionsFor[symbol];
    _.each(productions, function(production) {
      var proposedItem = self.newItem(production);
      if (!self.hasItem(proposedItem)) {
        self.addItem(proposedItem);
        self._stack.push(proposedItem);
      }
    });
  },

  _addReadyForItem : function(item) {
    var symbol = item.getSymbol();

    if (!this.readyFor[symbol]) {
      this.readyFor[symbol] = [];
    }
    this.readyFor[symbol].push(item);
  },

  _computeKey : function() {
    var itemKeys = _.map(_.values(this._itemsByKey), function(item) {
      return item.key;
    });
    
    itemKeys.sort(function(a, b) {
      return Number(a) - Number(b);
    });
    return itemKeys.join('_');
  }
});

module.exports = ItemSet;
