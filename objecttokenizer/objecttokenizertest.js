var ObjectTokenizer = require('./objecttokenizer.js');

var testObject = {
  a : 1,
  b : 'string',
  c : {
    d : 3,
    e : 6,
    f : {
      g : 'hello'
    }
  }
};

//var objectTokenizer = new ObjectTokenizer(testObject);
var objectTokenizer = new ObjectTokenizer({
  object : testObject
});
var objectToken = null;

while (objectToken = objectTokenizer.getNextToken()) {
  console.log(objectToken);
  console.log("Id:\n", objectToken.getId());
}
