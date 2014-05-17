var Schema = require('../schema/schema.js');

module.exports = new Schema({
  id : 'F',
  dependencies : ["A"],
  syntax : {
    "bb" : "number",
    "a"  : "A"
  },
  semantics : {
    printSomething : function() {
console.log("Inside /Users/terranceford/JFDL/test/f.js.printSomething, got called.\n");
      var basic = "something about f\n";

      if (this.a) {
        basic = basic + this.a.printSomething();
      }
      return basic;
    }
  }
});
