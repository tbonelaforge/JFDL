var ObjectToken     = require('./objecttoken.js');
var _               = require('underscore');

// Class
var SyntaxToken = function SyntaxToken(options) {
  ObjectToken.call(this, options);
};

// Class Methods
_.extend(SyntaxToken, ObjectToken, {

});

// Instance Methods
_.extend(SyntaxToken.prototype, ObjectToken.prototype, {
  getId : function() {
    var id = null;

    if (this.isDelimiter()) {
      id = this._data;
    } else if (this.isKey()) {
      id = 'key';
    } else if (this.isEof()) {
      id = 'eof';
    } else {
      id = this._data;
    }
    if (!id) {
      throw new Error("Can't compute id for token.\n");
    }
    return id;
  }

});

module.exports = SyntaxToken;
