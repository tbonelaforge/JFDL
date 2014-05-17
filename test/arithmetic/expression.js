var Schema = require('../../schema/schema.js');

var Expression = new Schema({
  id : "EXPRESSION",
  dependencies : ['MULTIPLY', 'ADD'],
  syntax : {
    value   : "number",
    product : "MULTIPLY",
    sum     : "ADD"
  },
  semantics : {
    evaluate : function() {
      if (this.value) {
        return this.value;
      }
      return this.getTree().evaluate();
    },
    getTree : function() {
      if (this.product) {
        return this.product;
      }
      if (this.sum) {
        return this.sum;
      }
    }
  }
});

module.exports = Expression;
