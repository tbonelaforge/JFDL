var _ = require('underscore');
var StackManager = require('../stackmanager.js');
var ObjectFrame = require('./objectframe.js');
var ObjectToken = require('./objecttoken.js');

var ObjectTokenizer = function(options) {
  this._TokenModel = options.TokenModel || ObjectToken;
  this._object = options.object;
  if (!this._object) {
    throw new Error("Can't tokenize nonexistent object\n");
  }

  StackManager.call(this);
  this.initializeStack();
  this._started = false;
};

_.extend(ObjectTokenizer.prototype, StackManager.prototype, {
  getNextToken : function() {
    var stackTop = this.getStackTop();
    var nextToken = null;

    if (!stackTop && this._started) {
      return null;
    }
    if (!stackTop && !this._started) {
      this._stack.push(new ObjectFrame({
        object     : this._object,
        TokenModel : this._TokenModel
      }));
      this._started = true;
      return this._TokenModel.START;
    }
    if (nextToken = stackTop.getNextToken()) { 

      // The object has not been used up yet.
      return this._handleNextToken(nextToken);
    }

    // Else, The object frame has just ended.
    this._stack.pop();
    return this._TokenModel.STOP;
  },

  getKeyPath : function() {
    var keyPath     = '';
    var i           = null;
    var objectFrame = null;

    for (i = 0; i < this._stack.length; i++) {
      objectFrame = this._stack[i];
      keyPath = keyPath + objectFrame.getLastKey();
      if (i <= this._stack.length - 2) {
        keyPath = keyPath + '.';
      }
    }
    return keyPath;
  },

  _handleNextToken : function(nextToken) {

    // Return keys or atomic values.
    if (nextToken.isKey() || 
        nextToken.getAtomicDataType()) {

      return nextToken;
    }
    
    // Otherwise, start a whole new object.
    this._stack.push(new ObjectFrame({
      object     : nextToken.getData(),
      TokenModel : this._TokenModel
    }));
    return this._TokenModel.START;
  }
});

module.exports = ObjectTokenizer;
