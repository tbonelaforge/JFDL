var _              = require('underscore');
var TransitionBase = require('./transitionbase.js');

var ShiftTransition = function(state) {
  TransitionBase.call(this, 'shift');
  this.state = state;
};

_.extend(ShiftTransition.prototype, TransitionBase.prototype, {

});

module.exports = ShiftTransition;
