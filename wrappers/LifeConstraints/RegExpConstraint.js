var StringConstraint = require('./StringConstraint.js'),
    Errors = require('./Errors.js');

/**
 * RegExpConstraint class for constraints
 *
 * @class RegExpConstraint
 * @constructor
 */
var RegExpConstraint = function (regexp, key, required) {
    this._regexp = regexp;

    StringConstraint.call(this, key, required);
};

RegExpConstraint.prototype = new StringConstraint();
RegExpConstraint.prototype.constructor = StringConstraint;

RegExpConstraint.prototype.addon = function () {
    return this._regexp.toString();
};

RegExpConstraint.prototype.regexp = function () {
    return this._regexp;
};

RegExpConstraint.prototype.validate = function (validator, cb) {
    if (!this._regexp.test(validator.data[this.key])) {
        validator.errors.push(new Errors.BadFormat(this.key, validator.data[this.key]));
    }

    return StringConstraint.prototype.validate.call(this, validator, cb);
};

module.exports = RegExpConstraint;