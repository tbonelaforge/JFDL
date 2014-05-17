var SyntaxTokenizer = require('./syntaxtokenizer.js');

var testObject = {
  "b" : {
    "c" : "string",
    "d" : "number"
  },
  "e" : "boolean"
};

var syntaxTokenizer = new SyntaxTokenizer({
  object : testObject
});

console.log("Inside syntaxtokenizertest, just constructed the new syntaxTokenizer, which looks like:\n", syntaxTokenizer);

var syntaxToken = null;

while (syntaxToken = syntaxTokenizer.getNextToken()) {
  console.log(syntaxToken);
  console.log("Id:\n", syntaxToken.getId());
}
