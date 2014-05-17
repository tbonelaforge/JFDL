var _                = require('underscore');
var LRParser         = require('./lrparser.js');
var Production       = require('./production.js');
var ShiftTransition  = require('./transition/shifttransition.js');
var ReduceTransition = require('./transition/reducetransition.js');
var GotoTransition   = require('./transition/gototransition.js');
//var ObjectTokenizer  = require('./objecttokenizer/objecttokenizer.js');
//var ObjectToken      = require('./objecttokenizer/objecttoken.js');

var grammar = new Array(6);
var reductions = new Array(6);

console.log("Inside /Users/terranceford/JFDL/lrparsertest.js, about to construct a new production.\n");

var reduction = function(type) { 
  return function() { 
    return { 
      type     : type, 
      children : arguments
    }; 
  }; 
};

grammar[0] = new Production('PHI -> A eof');
reductions[0] = reduction('PHI');
grammar[1] = new Production('A -> { APAIRS }');
reductions[1] = reduction('A');
grammar[2] = new Production('APAIRS -> APAIRS APAIR');
reductions[2] = reduction('APAIRS');
grammar[3] = new Production('APAIRS -> APAIR');
reductions[3] = reduction('APAIRS');
grammar[4] = new Production('APAIR -> key_a A');
reductions[4] = reduction('APAIR');
grammar[5] = new Production('APAIR -> key_b number');
reductions[5] = reduction('APAIR');

var testGrammar1 = {};

_.extend(testGrammar1, {
  getProduction : function(index) {
    return grammar[index];
  },
  getReduction : function(index) {
    return undefined;
  }
});


console.log("Inside /Users/terranceford/JFDL/lrparsertest.js, just got done constructing the grammar, it looks like:\n", grammar);

var table = new Array(12);

table[0] = {
  '{' : new ShiftTransition(2),
  'A' : new GotoTransition(1)
};

table[1] = {
  'eof' : new ShiftTransition(3)
};

table[2] = {
  'key_a'  : new ShiftTransition(6),
  'key_b'  : new ShiftTransition(7),
  'APAIRS' : new GotoTransition(4),
  'APAIR'  : new GotoTransition(5)
};

table[3] = {};

table[4] = {
  '}'      : new ShiftTransition(8),
  'key_a'  : new ShiftTransition(6),
  'key_b'  : new ShiftTransition(7),
  'APAIR'  : new GotoTransition(9)
};

table[5] = {
  '}'      : new ReduceTransition(3),
  'key_a'  : new ReduceTransition(3),
  'key_b'  : new ReduceTransition(3)
};

table[6] = {
  '{'      : new ShiftTransition(2),
  'A'      : new GotoTransition(10)
};

table[7] = {
  'number' : new ShiftTransition(11)
};

table[8] = {
  '}'     : new ReduceTransition(1),
  'key_a' : new ReduceTransition(1),
  'key_b' : new ReduceTransition(1),
  'eof'   : new ReduceTransition(1)
};

table[9] = {
  '}'     : new ReduceTransition(2),
  'key_a' : new ReduceTransition(2),
  'key_b' : new ReduceTransition(2)
};

table[10] = {
  '}'     : new ReduceTransition(4),
  'key_a' : new ReduceTransition(4),
  'key_b' : new ReduceTransition(4)
};

table[11] = {
  '}'     : new ReduceTransition(5),
  'key_a' : new ReduceTransition(5),
  'key_b' : new ReduceTransition(5)
};


// TEST SCENARIO 1

var lrparser1 = new LRParser({
  grammar        : testGrammar1,
  table          : table,
  acceptingState : 3
});


/* Default parser, valid object. */
var testObject = {
  a : {
    b : 2
  },
  b : 1
};

var result = lrparser1.parse(testObject);

console.log("The result is:\n", result);



/* Default parser, invalid value. */
var testObject2 = {
  a : {
    b : '22'
  },
  b : '1'
};

var error = {};
var result = lrparser1.parse(testObject2, error);

console.log("The result is:\n", result);
console.log("The error object is:\n", error);

/* Default parser, invalid key */
var testObject3 = {
  a : {
    b : 22
  },
  b : 1,
  c : 5
};

var error = {};
var result = lrparser1.parse(testObject3, error);

console.log("The result is:\n", result);
console.log("The error object is:\n", error);


// TEST SCENARIO 2

var testGrammar2 = {};

_.extend(testGrammar2, {
  getProduction : function(index) {
    return grammar[index];
  },
  getReduction : function(index) {
    return reductions[index];
  }
});


var lrparser2 = new LRParser({
  grammar        : testGrammar2,
  table          : table,
  acceptingState : 3
});



/* Default parser, valid object. */
var testObject = {
  a : {
    b : 2
  },
  b : 1
};

var result = lrparser2.parse(testObject);

console.log("The result is:\n", JSON.stringify(result, null, 2));



/* Default parser, invalid value. */
var testObject2 = {
  a : {
    b : '22'
  },
  b : '1'
};

var error = {};
var result = lrparser2.parse(testObject2, error);

console.log("The result is:\n", result);
console.log("The error object is:\n", error);


/* Default parser, invalid key */
var testObject3 = {
  a : {
    b : 22
  },
  b : 1,
  c : 5
};

var error = {};
var result = lrparser2.parse(testObject3, error);

console.log("The result is:\n", result);
console.log("The error object is:\n", error);


// TEST SCENARIO 3

