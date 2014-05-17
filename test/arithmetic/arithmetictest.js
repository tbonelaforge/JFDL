require('../../schema/schema.js').setDirectory(__dirname);
var Expression = require('./expression.js');
var assert = require('assert');

function contains(err, string) {
  var regex = new RegExp(string, 'i');
  return regex.test(err.reason.toString());
}

describe('Arithmetic Schema', function() {
  it('should evaluate simple numbers', function(done) {
    var testExpression = {
      value : 5
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      var evaluation = null;

      assert(!err, 'got no error');
      evaluation = loadedExpression.evaluate();
      assert(evaluation === 5, "Evaluated correctly");
      done();
    });  
  }); // End simple number test.

  it('should register an error if a sum is in the wrong form.', function(done) {
    var testExpression = {
      sum : {
        leftSummand : 2,
        rightSummand : 4
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      assert(err, "got error");
      assert(contains(err, 'sum.leftSummand'), "the error was somewhat specific.");
      done();
    });
  }); // End sum in wrong form case.

  it('should register an error if the expression is in a more subtle wrong form.', function(done) {
    var testExpression = {
      sum : {
        leftSummand : {
          value : 2
        },
        rightSummand : 4
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      assert(err, "got error");
      assert(contains(err, 'sum.rightSummand'), "the error was somewhat specific.");
      done();
    });
  }); // End expression in more sublte wrong form case.


  it('should register an error if the expression is in a more subtle wrong form.', function(done) {
    var testExpression = {
      sum : {
        leftSummand : {
          value : 2
        },
        rightSummand : {
          value : 4
        }
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      var evaluation = null;

      assert(!err, "got no error");
      evaluation = loadedExpression.evaluate();
      assert(evaluation === 6, "evaluated simple sum");
      done();
    });
  }); // End evaluate simple addition case.

  it('should register an error if a product is in the wrong form.', function(done) {
    var testExpression = {
      product : {
        leftSummand : 2,
        rightSummand : 4
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      assert(err, "got error");
      assert(contains(err, 'product.leftSummand'), "the error was somewhat specific.");
      done();
    });
  }); // End product in wrong form case.

  it('should register an error if a product is in the wrong form.', function(done) {
    var testExpression = {
      product : {
        leftMultiplicand : {
          value : 2
        },
        rightSummand : 4
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      assert(err, "got error");
      assert(contains(err, 'product.rightSummand'), "the error was somewhat specific.");
      done();
    });
  }); // End product in more subtle wrong form case.

    it('should evaluate a simple multiplication.', function(done) {
    var testExpression = {
      product : {
        leftMultiplicand : {
          value : 2
        },
        rightMultiplicand : {
          value : 4
        }
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      var evaluation = null;

      assert(!err, "got no error");
      evaluation = loadedExpression.evaluate();
      assert(evaluation === 8, "evaluated simple product");
      done();
    });
  }); // End evaluate simple multiplication case.

  it('should register an error if an expression has a deep syntax error.', function(done) {
    var testExpression = {
      sum : {
        leftSummand : {
          value : 2
        },
        rightSummand : {
          product : {
            leftMultiplicand : {
              value : 4
            },
            rightMultiplicand : 5
          }
        }
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      assert(err, "got error");
      assert(contains(err, 'sum.rightSummand.product.rightMultiplicand'), "the error was somewhat specific.");
      done();
    });
  }); // End expression with deep error case.

  it('should evaluate a valid deep expression.', function(done) {
    var testExpression = {
      sum : {
        leftSummand : {
          value : 2
        },
        rightSummand : {
          product : {
            leftMultiplicand : {
              value : 4
            },
            rightMultiplicand : {
              sum : {
                leftSummand : {
                  value : 8
                },
                rightSummand : {
                  value : 16
                }
              }
            }
          }
        }
      }
    };

    Expression.load(testExpression, function(err, loadedExpression) {
      var evaluation = null;

      assert(!err, "got no error");
      evaluation = loadedExpression.evaluate();
      assert(evaluation === 98, "Got the right evaluation");
      done();
    });
  }); // End evaluate deep expression case.

});


