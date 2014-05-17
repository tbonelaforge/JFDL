var _ = require('underscore');
var ObjectToken = require('./objecttoken.js');


var ObjectFrame = function(options) {
  this._TokenModel = options.TokenModel || ObjectToken;
  this._object = options.object;

  if (!this._object) {
    throw new Error("Can't construct object frame without object.");
  }
  this._keys = _.keys(this._object);
  this._position = 0;
};

_.extend(ObjectFrame.prototype, {
  getNextToken : function() {
    var nextToken = null;
    var key = null;

    // If the object frame is all used up ( make function ).
    if (this._position >= 2 * this._keys.length) {
      return null;
    }
    nextToken = this._getTokenAtPosition();
    this._position++;
    return nextToken;
  },

  isOnValue : function(position) {  
    var currentRemainder = this._getRemainder(position);

    return (currentRemainder == 1) ? true : false;
  },

  wasOnValue : function() {
    return this.isOnValue(this._position - 1);
  },

  getKey : function(position) {
    var remainder = this._getRemainder(position);
    var keyIndex = (position - remainder) / 2;

    return this._keys[keyIndex];
  },

  getLastKey : function() {
    return this.getKey(this._position - 1);
  },

  _getTokenAtPosition : function() {
    var key   = this.getKey(this._position);

    if (this.isOnValue(this._position)) {
      return new this._TokenModel({
        type : 'value',
        data : this._object[key]
      });
    } 

    // Otherwise, we're on a key.
    return new this._TokenModel({
      type : 'key',
      data : key
    });
  },

  _getRemainder : function(position) {
    return position % 2;
  },
});

module.exports = ObjectFrame;
