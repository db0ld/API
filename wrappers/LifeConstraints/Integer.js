var Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js');

/**
 * Integer. class for constraints
 *
 * @class Integer.
 * @constructor
 */
var Integer = function (key, required) {
    Abstract.call(this, key, required);
};

Integer.prototype = new Abstract();
Integer.prototype.constructor = Abstract;

Integer.prototype.doc = function () {
    return 'Integer';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Integer.prototype.validate = function (validator, cb) {
    var number = parseInt(validator.data[this.key], 10);

    if (Number.isNaN(number)) {
        validator.errors.push(new Errors.NotANumber(this.key, validator.data[this.key]));
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
Integer.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = parseInt(validator.data[this.key], 10);

    return cb();
};

module.exports = Integer;