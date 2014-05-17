var _ = require('underscore');

var TransitionBase = function(action) {
  this._action = action;
};

_.extend(TransitionBase.prototype, {
  isShift : function() {
    return (this._action == 'shift');
  },

  isReduce : function() {
    return (this._action == 'reduce');
  },

  isGoto : function() {
    return (this._action == 'goto');
  }
});

module.exports = TransitionBase;
