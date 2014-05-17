var LRParserGenerator = require('./lrparsergenerator/lrparsergenerator.js');
var Production        = require('./production.js');
var _                 = require('underscore');

var productionStrings = [
  'A -> { APAIRS }',
  'APAIRS -> APAIRS APAIR',
  'APAIRS -> APAIR',
  'APAIR -> key_a A',
  'APAIR -> key_b number'
];

// TEST SCENARIO 1

var grammarData1 = _.map(productionStrings, function(productionString) {
  return {
    production : productionString
  };
});

var newLRParserGenerator = new LRParserGenerator(grammarData1);

var lrparser = newLRParserGenerator.generate();

console.log("Inside /Users/terranceford/JFDL/jfdltest.js, after generating the new lrparser, it looks like:\n", lrparser);

var testObject = {
  a : {
    b : 2
  },
  b : 1
};

var result = lrparser.parse(testObject);

console.log("The result is:\n", result);


// TEST SCENARIO 2

var makeReduction = function(type) { 
  return function() { 
    return { 
      type     : type, 
      children : arguments
    }; 
  }; 
};

var grammarData2 = _.map(productionStrings, function(productionString) {
  var type = (new Production(productionString)).lhs;

  return {
    production : productionString,
    reduction  : makeReduction(type)
  };
});

var newLRParserGenerator = new LRParserGenerator(grammarData2);

var lrparser2 = newLRParserGenerator.generate();

console.log("Inside /Users/terranceford/JFDL/jfdltest.js, after generating the new lrparser, it looks like:\n", lrparser);

var testObject = {
  a : {
    b : 2
  },
  b : 1
};

var result2 = lrparser2.parse(testObject);

console.log("The result is:\n", JSON.stringify(result2, null, 2));
