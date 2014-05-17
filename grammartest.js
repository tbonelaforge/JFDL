var Grammar = require('./grammar.js');

var productionStrings = [
  "A -> B c D",
  "A -> B",
  "B -> d e f",
  "B -> D",
  "D -> e f B"
];

var newGrammar = new Grammar(productionStrings);

console.log("The new Grammar object looks like:\n", newGrammar);
