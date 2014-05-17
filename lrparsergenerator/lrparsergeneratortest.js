var LRParserGenerator = require('./lrparsergenerator.js');
var GotoTransition    = require('../transition/gototransition.js');
var ReduceTransition  = require('../transition/reducetransition.js');
var ShiftTransition   = require('../transition/shifttransition.js');
var _                 = require('underscore');
var assert            = require('chai').assert;

/*
  var productionStrings = [
  "A -> B c D g",
  "A -> B",
  "B -> d e f",
  "B -> D",
  "D -> e f B"
  ];

  console.log("ABout to construct a new LRParserGenerator...\n");

  var newLRParserGenerator = new LRParserGenerator(productionStrings);

  console.log("After constructing the new LRParserGenerator, it looks like:\n", newLRParserGenerator);

  console.log("About to generate a new parser.\n");

  var newLRParser = newLRParserGenerator.generate();

  console.log("After generating the new parser, it looks like:\n", newLRParser);

  console.log("The transition table looks like:\n", JSON.stringify(newLRParser.table, null, 2));
*/

/*
  var simpleProductionStrings = [
  "A -> A b",
  "A -> b"
  ];

  var simpleLRParserGenerator = new LRParserGenerator(simpleProductionStrings);

  var simpleLRParser = simpleLRParserGenerator.generate();


  console.log("After generating the simple new parser, it looks like:\n", simpleLRParser);

  console.log("The transition table looks like:\n", JSON.stringify(simpleLRParser.table, null, 2));
*/

describe('LRParserGenerator', function() {
  xit('should generate the right parsing table for a simple grammar', function() {

    var testProductionStrings = [
      'A -> { APAIRS }',
      'APAIRS -> APAIRS APAIR',
      'APAIRS -> APAIR',
      'APAIR -> key_a A',
      'APAIR -> key_b number'
    ];

    var grammarData = _.map(testProductionStrings, function(productionString) {
      return {
        production : productionString
      };
    });

    var testLRParser = (new LRParserGenerator(grammarData)).generate();

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

    assert.deepEqual(testLRParser.table, table);
    
  });

  xit('should throw an error when given an ambiguous grammar', function() {

    var testProductionStrings = [
      'A -> a A',
      'A -> A a'
    ];

    var grammarData = _.map(testProductionStrings, function(productionString) {
      return {
        production : productionString
      };
    });

    assert.throws(function() {
      var newLRParser = (new LRParserGenerator(grammarData)).generate();
    }, /ambiguous/i);
    
  });

  it("should be able to generate a parser that hydrates a given given object.\n", function() {
    
    var A = function(options) {
      this._summand1 = options.summand1 || 0;
      this._summand2 = options.summand2 || 0;
    }
    
    _.extend(A.prototype, {
      evaluate : function() {
        var summand1 = this._summand1;
        var summand2 = this._summand2;

        if (summand1.evaluate && typeof summand1.evaluate === 'function') {
          summand1 = summand1.evaluate();
        }
        if (summand2.evaluate && typeof summand2.evaluate === 'function') {
          summand2 = summand2.evaluate();
        }
        return summand1 + summand2;
      }
    });


    var constructObject = function(constituents) {
      var leftBrace     = constituents[0];
      var keyValuePairs = constituents[1];
      var rightBrace    = constituents[2];
      console.log("Inside constructObject, the constituents (leftBrace, keyVAluePairs, rightBrace) are:\n", leftBrace, "\n", keyValuePairs, "\n", rightBrace);
      
      return new A(keyValuePairs);
    };

    var absorbPair = function(constituents) {
      var keyValuePairs = constituents[0];
      var pair = constituents[1];

      keyValuePairs[pair.key] = pair.value;
      return keyValuePairs;
    };

    var startKeyValuePairs = function(constituents) {
      var pair = constituents[0];
      var keyValuePairs = {};

      keyValuePairs[pair.key] = pair.value;
      return keyValuePairs;
    };
    
    var recordPair = function(constituents) {
      console.log("Inside recordPair, got called with constituents:\n", constituents);
      var key = constituents[0].getData();
      var value = constituents[1];
      
      var pair = {
        key : key,
        value : value
      };
      console.log("Inside recordPair, about to return:\n", pair);
      return pair;
    };
    
    var extractNumber = function(constituents) {
      var number = constituents[0].getData();

      return number;
    };
    
    var transitiveUp = function(constituents) {
      return constituents[0];
    };

    var grammarData = [
      {
        production : 'A -> { APAIRS }',
        reduction : constructObject
      },
      {
        production : 'APAIRS -> APAIRS APAIR',
        reduction : absorbPair
      },
      {
        production : 'APAIRS -> APAIR',
        reduction : startKeyValuePairs
      },
      {
        production : 'APAIR -> key_summand1 VALUE',
        reduction : recordPair
      },
      {
        production : 'APAIR -> key_summand2 VALUE',
        reduction : recordPair
      },
      {
        production : 'VALUE -> number',
        reduction : extractNumber
      },
      {
        production : 'VALUE -> A',
        reduction : transitiveUp
      }
    ];
    console.log("About to generate an A parser.\n");
    var aParser = (new LRParserGenerator(grammarData)).generate();
    console.log("Just generated the A parser, now it looks like:\n", aParser);
    console.log("About to parse something that should add up to 10...\n");
    var testData = {
      summand1 : {
        summand1 : 1,
        summand2 : 2
      },
      summand2 : {
        summand1 : {
          summand1 : 4
        },
        summand2 : {
          summand2 : 3
        }
      }
    };

    var resultantA = aParser.parse(testData);
    console.log("The resultantA is:\n", resultantA);

    console.log("The result of evaluating the resultantA is:\n");
    var result = resultantA.evaluate();
    console.log(result);

  });

});
