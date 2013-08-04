var Errors = require('./Errors.js'),
    LifeValidator = require('../LifeValidator.js');

/**
 * Abstract class for constraints
 *
 * @class Abstract
 * @constructor
 */
var Abstract = function (key, required) {
    this.key = key;
    this._required = (required !== undefined) ? required : true;
    this._fallback = null;
    this.nextConstraint = null;
};

/**
 * Documentation for current constraint, usually returns type
 *
 * @return String
 * @method
 */
Abstract.prototype.doc = function () {
    return 'No doc';
};

/**
 * If current constraint is a regexp, get it
 *
 * @return RegExp
 * @method
 */
Abstract.prototype.regexp = function () {
    return null;
};

/**
 * Get/set default value for current validator
 *
 * @return *
 * @method
 */
Abstract.prototype.fallback = function (value) {
    if (arguments.length !== 0) {
        this._fallback = value;

        return this;
    }
    return this._fallback;
};

/**
 * Additional advices concerning this constraint
 *
 * @return String
 * @method
 */
Abstract.prototype.addon = function () {
    return null;
};

Abstract.prototype.required = function (cb) {
    return cb(this._required);
};

Abstract.prototype.present = function (validator, cb) {
    return cb(validator.data[this.key] !== undefined);
};

Abstract.prototype.test = function (value, req, cb) {
    cb = typeof req === 'function' ? req : cb;
    req = typeof req === 'object' ? req : null;

    var data = {};
    data[this.key] = value;

    return new LifeValidator([this], req, cb.bind(this, false))
        .data(data)
        .validate(cb.bind(this, true));
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Abstract.prototype.validate = function (validator, cb) {
    if (this.required && this.key && validator.data[this.key] === undefined) {
        validator.errors.push({
            key: this.key,
            value: validator.data[this.key],
            error: Errors.MissingParameter
        });
    }

    if (this.nextConstraint) {
        return this.nextConstraint.validate(validator, cb);
    }

    return cb();
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Abstract.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = validator.data[this.key];

    return cb();
};

/**
 * Add an additional constraint rule for the current field
 * will not be used for sanitization.
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Abstract.prototype.add = function (nextConstraint) {
    if (this.nextConstraint) {
        this.nextConstraint.add(nextConstraint);
    } else {
        this.nextConstraint = nextConstraint;
    }

    return this;
};

module.exports = Abstract;