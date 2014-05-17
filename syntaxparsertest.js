var SyntaxParser = require('./syntaxparser.js');
var ObjectTokenizer = require('./objecttokenizer/objecttokenizer.js');
var LRParserGenerator = require('./lrparsergenerator/lrparsergenerator.js');
var _ = require('underscore');

var A = {
  "b" : {
    "c" : "string",
    "d" : "number"
  },
  "e" : "boolean"
};

var syntaxParser = new SyntaxParser({
  startSymbol : 'A'
});

var err = {};

var grammarData = syntaxParser.parse(A, err);

//syntaxParser.parse(A, function(err, grammarData) {

if (_.keys(err).length) {
  console.log("Got errors:\n", err);
  process.exit(0);
}

console.log("Got grammarData:\n", grammarData);

var testObject = {
  "b" : {
    "c" : "string",
    "d" : 2
  },
  "e" : true
};
console.log("About to validate the test object.\n");
var testObjectErrors = {};
var lrparser = (new LRParserGenerator(grammarData)).generate(ObjectTokenizer);
var validationResult = lrparser.parse(testObject, testObjectErrors);
console.log("After parsing the testObject, the validation result is:\n", validationResult);
console.log("After parsing the testObject, the errors are:\n", testObjectErrors);

var testObject2 = {
  "e" : 'false',
  "b" : {
    "c" : "string",
    "d" : 2
  }
};

console.log("About to validate the second test object:\n");
testObjectErrors = {};
var validationResult2 = lrparser.parse(testObject2, testObjectErrors);
console.log("After parsing the testObject2, the validation result is:\n", validationResult2);
console.log("After parsing the testObject2, the testObjectErrors are:\n", testObjectErrors);
