var Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js');

/**
 * DateTime class for constraints
 *
 * @class DateTime
 * @constructor
 */
var DateTime = function (key, required) {
    Abstract.call(this, key, required);
};

DateTime.prototype = new Abstract();
DateTime.prototype.constructor = Abstract;

DateTime.prototype.doc = function () {
    return 'DateTime';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
DateTime.prototype.validate = function (validator, cb) {
    var date = new Date(validator.data[this.key]);

    if (Number.isNaN(date.getTime())) {
        validator.errors.push(new Errors.InvalidDate(this.key, validator.data[this.key]));
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
DateTime.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = new Date(validator.data[this.key]);

    return cb();
};

module.exports = DateTime;