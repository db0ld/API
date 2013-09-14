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