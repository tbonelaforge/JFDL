var Schema = require('../../schema/schema.js');

var Multiply = new Schema({
  id : "MULTIPLY",
  dependencies : ['EXPRESSION'],
  syntax : {
    leftMultiplicand : "EXPRESSION",
    rightMultiplicand : "EXPRESSION"
  },
  semantics : {
    evaluate : function() {
      if (this.leftMultiplicand && this.rightMultiplicand) {
        return (
          this.leftMultiplicand.evaluate() *
          this.rightMultiplicand.evaluate()
        );
      }
      return undefined;
    }
  }
});

module.exports = Multiply;
