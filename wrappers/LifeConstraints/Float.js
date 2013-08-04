var Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js');

/**
 * Float class for constraints
 *
 * @class Float
 * @constructor
 */
var Float = function (key, required) {
    Abstract.call(this, key, required);
};

Float.prototype = new Abstract();
Float.prototype.constructor = Abstract;

Float.prototype.doc = function () {
    return 'Float';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Float.prototype.validate = function (validator, cb) {
    var number = parseFloat(validator.data[this.key]);

    if (Number.isNaN(number)) {
        validator.errors.push({
            key: this.key,
            value: validator.data[this.key],
            error: Errors.NotANumber
        });
    } else if (this.nextConstraint) {
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
Float.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = parseFloat(validator.data[this.key]);

    return cb();
};

module.exports = Float;