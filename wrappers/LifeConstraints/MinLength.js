var StringConstraint = require('./StringConstraint.js'),
    Errors = require('./Errors.js');

/**
 * MinLength class for constraints
 *
 * @class MinLength
 * @constructor
 */
var MinLength = function (minlength, key, required) {
    this.minlength = minlength;

    StringConstraint.call(this, key, required);
};

MinLength.prototype = new StringConstraint();
MinLength.prototype.constructor = StringConstraint;

MinLength.prototype.addon = function () {
    return 'Min len. ' + this.minlength;
};

MinLength.prototype.validate = function (validator, cb) {
    if (validator.data[this.key].length < this.minlength) {
        validator.errors.push({
            key: this.key,
            value: validator.data[this.key],
            error: Errors.TooShort
        });
    } else if (this.nextConstraint) {
        return this.nextConstraint.validate(validator, cb);
    }

    return StringConstraint.prototype.validate.call(this, validator, cb);
};

module.exports = MinLength;