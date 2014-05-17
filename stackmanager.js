var _ = require('underscore');

var StackManager = function() {
  this._stack = null;
};

_.extend(StackManager.prototype, {
  initializeStack : function() {
    this._stack = [];
  },

  getStack : function() {
    return this._stack.slice(0);
  },

  getStackTop : function() {
    return this._stack[this._stack.length - 1];
  },

  popMultiple : function(howManyPops) {
    var popped = [];
    var i      = null;

    for (i = 0; i < howManyPops; i++) {
      popped.unshift(this._stack.pop());
    }
    return popped;
  }

});


module.exports = StackManager;
