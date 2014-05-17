var Schema = require('../schema/schema.js');
var mongodb = requre('mongodb');
var _ = require('underscore');



// Constructor
var MongoSchema = function(options) {
  Schema.call(this, options);
  this._collection = null;
};

// Class Methods
_.extend(MongoSchema, {
  _uri          : 'mongodb://127.0.0.1:27017/test',
  _connection   : null,
  getConnection : function(callback) {
    var self = this;
    if (self._connection) {
      return callback(null, self._connection);
    }
    mongodb.MongoClient.connect(self._uri, function(err, connection) {
      if (err) {
        return callback(err);
      }
      self._connection = connection;
      callback(err, self._connection);
    });
  }
});

// Instance Methods
_.extend(MongoSchema.prototype, {
  getCollection : function(callback) {
    var self = this;
    if (self._collection) {
      return callback(null, self._collection);
    }
    MongoSchema.getConnection(function(err, db) {
      if (err) {
        return callback(err);
      }
      self._collection = db.collection(self.getCollectionName());
      callback(err, self._collection);
    });
  },
  find : function(criteria, callback) {
    var self = this;

    self.getCollection(function(err, collection) {
      if (err) {
        return callback(err);
      }
      collection.find(criteria).toArray(function(err, docs) {
        if (err) {
          return callback(err);
        }
      });
    });
  }
});
