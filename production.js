var _ = require('underscore');

function isArrow(symbol) {
  var isArrowRegex = /\-\>/;

  return isArrowRegex.test(symbol);
}

var Production = function(string) {
  var symbols = string.split(' ');
  Production.checkFormat(symbols);
  this._string = string;
  this._symbols = symbols;
  this.lhs = symbols[0];
  this.rhs = symbols.slice(2);
};

_.extend(Production, {
  checkFormat : function(symbols) {
    if (symbols.length < 3 ||
        !isArrow(symbols[1])) {
      
      throw new Error("Production format not valid.");
    }
  }
});

_.extend(Production.prototype, {

  isEqual : function(production) {
    if (production._string === this._string) {
      return true;
    }
    return false;
  }

});

module.exports = Production;
