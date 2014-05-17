var _ = require('underscore');

var Item = function(options) {
  this._grammar = options.grammar;
  this.production = options.production;
  this._position = options.position;
  this.key = this._computeKey();
};

_.extend(Item.prototype, {
  getSymbol : function() {
    return this.production.rhs[this._position];
  },

  isComplete : function() {
    if (this._position >= this.production.rhs.length) {
      return true;
    }
    return false;
  },

  advance : function() {
    var advancedItem = new Item({
      grammar    : this._grammar,
      production : this.production,
      position   : this._position + 1
    });

    return advancedItem;
  },
  
  _computeKey : function() {
    var mod = this._grammar.maxRHSLength + 1;
    var prodNum = this._grammar.index(this.production);

    return prodNum * mod + this._position;
  }
});

module.exports = Item;
