var _              = require('underscore');
var TransitionBase = require('./transitionbase.js');

var ReduceTransition = function(productionNumber) {
  TransitionBase.call(this, 'reduce');
  this.productionNumber = productionNumber;
};

_.extend(ReduceTransition.prototype, TransitionBase.prototype, {

});

module.exports = ReduceTransition;
