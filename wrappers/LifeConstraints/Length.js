var StringConstraint = require('./StringConstraint.js'),
    Errors = require('./Errors.js'),
    MinLength = require('./MinLength.js'),
    MaxLength = require('./MaxLength.js');

/**
 * Length class for constraints
 *
 * @class Length
 * @constructor
 */
var Length = function (min_length, max_length, key, required) {
    StringConstraint.call(this, key, required);

    this.add(new MinLength(min_length, key, required));
    this.add(new MaxLength(max_length, key, required));
};

Length.prototype = new StringConstraint();
Length.prototype.constructor = StringConstraint;

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Length.prototype.validate = function (validator, cb) {
    return this.nextConstraint.validate(validator, cb);
};

module.exports = Length;