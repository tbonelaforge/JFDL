var _ = require('underscore');

var TransitionBase = require('./transitionbase.js');

var GotoTransition = function(newState) {
  TransitionBase.call(this, 'goto');

  this.newState = newState;
};

module.exports = GotoTransition;
