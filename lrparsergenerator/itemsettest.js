var ItemSet = require('./itemset.js');
var Item = require('./item.js');

var Production = require('../production.js');

var productionString1 = "A -> B C";
var production1 = new Production(productionString1);
var productionString2 = "A -> C";
var production2 = new Production(productionString2);
var productionString3 = "A -> d";
var production3 = new Production(productionString3);
var productionString4 = "C -> d e";
var production4 = new Production(productionString4);
var productionString5 = "B -> e";
var production5 = new Production(productionString5);
var productionString6 = "D -> A";
var production6 = new Production(productionString6);

var mockGrammar = {
  productionsFor : {
    A : [production1, production2, production3],
    B : [production5],
    C : [production4]
  },
  
  maxRHSLength : 2,
  
  hasNonterminal : function(symbol) {
    var nonTerminals = {
      A : 1,
      B : 1,
      C : 1
    };
    return nonTerminals[symbol];
  },

  index : function(production) {
    var productionIndicesByString = {};
    
    productionIndicesByString[production1._string] = 1;
    productionIndicesByString[production2._string] = 2;
    productionIndicesByString[production3._string] = 3;
    productionIndicesByString[production4._string] = 4;
    productionIndicesByString[production5._string] = 5;
    productionIndicesByString[production6._string] = 6;
    
    return productionIndicesByString[production._string];

  }
  
};

var itemset1 = new ItemSet({
  grammar : mockGrammar
});

var newItem1 = new Item({
  grammar    : mockGrammar,
  production : production6,
  position   : 0
});

itemset1.addItem(newItem1);

var key1 = itemset1.computeClosure();

console.log("Got key:\n", key1);




var itemset2 = new ItemSet({
  grammar : mockGrammar
});

var newItem2 = new Item({
  grammar    : mockGrammar,
  production : production5,
  position   : 0
});

itemset2.addItem(newItem2);

var key2 = itemset2.computeClosure();

console.log("Got key:\n", key2);





var itemset3 = new ItemSet({
  grammar : mockGrammar
});

var newItem3 = new Item({
  grammar    : mockGrammar,
  production : production4,
  position   : 0
});

itemset3.addItem(newItem3);

var key3 = itemset3.computeClosure();

console.log("Got key:\n", key3);







var itemset4 = new ItemSet({
  grammar : mockGrammar
});

var newItem4 = new Item({
  grammar    : mockGrammar,
  production : production3,
  position   : 0
});

itemset4.addItem(newItem4);

var key4 = itemset4.computeClosure();

console.log("Got key:\n", key4);







var itemset5 = new ItemSet({
  grammar : mockGrammar
});

var newItem5 = new Item({
  grammar    : mockGrammar,
  production : production2,
  position   : 0
});

itemset5.addItem(newItem5);

var key5 = itemset5.computeClosure();

console.log("Got key:\n", key5);




var itemset6 = new ItemSet({
  grammar : mockGrammar
});

var newItem6 = new Item({
  grammar    : mockGrammar,
  production : production1,
  position   : 0
});

itemset6.addItem(newItem6);

var key6 = itemset6.computeClosure();

console.log("Got key:\n", key6);
