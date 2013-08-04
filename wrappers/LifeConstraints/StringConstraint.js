var Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js');

/**
 * StringConstraint class for constraints
 *
 * @class StringConstraint
 * @constructor
 */
var StringConstraint = function (key, required) {
    Abstract.call(this, key, required);
};

StringConstraint.prototype = new Abstract();
StringConstraint.prototype.constructor = Abstract;

StringConstraint.prototype.doc = function () {
    return 'String';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
StringConstraint.prototype.validate = function (validator, cb) {
    if (this.nextConstraint) {
        return this.nextConstraint.validate(validator, cb);
    }

    return Abstract.prototype.validate.call(this, validator, cb);
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
StringConstraint.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = validator.data[this.key].trim();

    return cb();
};

module.exports = StringConstraint;