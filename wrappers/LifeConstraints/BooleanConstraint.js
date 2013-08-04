var Abstract = require('./Abstract.js');

/**
 * BooleanConstraint. class for constraints
 *
 * @class BooleanConstraint.
 * @constructor
 */
var BooleanConstraint = function (key, required) {
    Abstract.call(this, key, required);
};

BooleanConstraint.prototype = new Abstract();
BooleanConstraint.prototype.constructor = Abstract;


BooleanConstraint.prototype.doc = function () {
    return 'Boolean';
};

/**
 * Additional advices concerning this constraint
 *
 * @return String
 * @method
 */
BooleanConstraint.prototype.addon = function () {
    return '0 or 1';
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
BooleanConstraint.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = !!parseInt(validator.data[this.key], 10);

    return cb();
};

module.exports = BooleanConstraint;