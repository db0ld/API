var StringConstraint = require('./StringConstraint.js'),
    Errors = require('./Errors.js');

/**
 * MaxLength class for constraints
 *
 * @class MaxLength
 * @constructor
 */
var MaxLength = function (maxlength, key, required) {
    this.maxlength = maxlength;

    StringConstraint.call(this, key, required);
};

MaxLength.prototype = new StringConstraint();
MaxLength.prototype.constructor = StringConstraint;

MaxLength.prototype.addon = function () {
    return 'Max len. ' + this.maxlength;
};

MaxLength.prototype.validate = function (validator, cb) {
    if (validator.data[this.key].length > this.maxlength) {
        validator.errors.push(new Errors.TooLong(this.key, validator.data[this.key]));
    }

    return StringConstraint.prototype.validate.call(this, validator, cb);
};

module.exports = MaxLength;