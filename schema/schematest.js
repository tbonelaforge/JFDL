var A = require('./a');

console.log("The result of requiring A is:\n", A);

console.log("About to load a new object:\n");

var testJson1 = {
  "f" : {
    "bb" : 6534,
    "a" : {
      "f" : {
        "bb" : 6534
      }
    }
  }
};

A.load(testJson1, function(err, testObject1) {
  console.log("After loading the testJson1, inside the A.load callback, got called with err, testObject1:\n", err, "\n", testObject1);
  console.log("The result of calling printSomething on testObject1 is:\n", testObject1.printSomething());
});
