var Schema = require('../../schema/schema.js');

var Add = new Schema({
  id : "ADD",
  dependencies : ["EXPRESSION"],
  syntax : {
    leftSummand : "EXPRESSION",
    rightSummand : "EXPRESSION"
  },
  semantics : {
    evaluate : function() {
      if (this.leftSummand && this.rightSummand) {
        return (
          this.leftSummand.evaluate() +
          this.rightSummand.evaluate()
        );
      }
      return undefined;
    }
  }
});

module.exports = Add;
