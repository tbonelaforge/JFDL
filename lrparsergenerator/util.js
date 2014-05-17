var _ = require('underscore');

module.exports.installKeys = function(options) {
  var sourceObject = options.source || {};
  var targetObject = options.target || {};
  var howManyKeysInstalled = 0;
  
  _.each(sourceObject, function(sourceValue, sourceKey) {
    if (!targetObject[sourceKey]) {
      howManyKeysInstalled++;
      targetObject[sourceKey] = sourceValue;
    }
  });
  return howManyKeysInstalled;
};
