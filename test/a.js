var Schema = require('../schema/schema.js');

module.exports = new Schema({
  id : 'A',
  dependencies : ['F'],
  syntax : {
    "f" : "F"
  },
  semantics : {
    printSomething : function() {
console.log("Inside /Users/terranceford/JFDL/test/a.js.printsomething, got called.\n");
      return "Something about a, a.f is:\n" + this.f.printSomething();
    }
  }
});
