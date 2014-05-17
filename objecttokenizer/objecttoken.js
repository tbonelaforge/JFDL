var _ = require('underscore');

var ObjectToken = function ObjectToken(options) {
  this._type = options.type;
  this._data = options.data;
};

ObjectToken.START = new ObjectToken({
  type : 'delimiter',
  data : '{'
});

ObjectToken.STOP = new ObjectToken({
  type : 'delimiter',
  data : '}'
});

ObjectToken.EOF = new ObjectToken({
  type : 'eof'
});

_.extend(ObjectToken.prototype, {
  getType : function() {
    return this._type;
  },
  getData : function() {
    return this._data;
  },
  isKey : function() {
    return (this._type == 'key');
  },

  isValue : function() {
    return (this._type == 'value');
  },

  isDelimiter : function() {
    return (this._type == 'delimiter');
  },

  isEof : function() {
    return (this._type == 'eof');
  },

  getId : function() {
    var id = null;

    if (this.isDelimiter()) {
      id = this._data;
    } else if (this.isKey()) {
      id = 'key_' + this._data;
    } else if (this.isEof()) {
      id = 'eof';
    } else {
      id = this.getAtomicDataType();
    }
    if (!id) {
      throw new Error("Can't compute id for token.\n");
    }
    return id;  
  },

  getAtomicDataType : function() {
    if (_.isNumber(this._data)) {
      return 'number';
    }
    if (_.isString(this._data)) {
      return 'string';
    }
    if (_.isBoolean(this._data)) {
      return 'boolean';
    }
    return null;
  }
});

module.exports = ObjectToken;
