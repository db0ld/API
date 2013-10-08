var Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js'),
    LifeValidator = require('../LifeValidator.js');

/**
 * BinaryLogic class for constraints
 * Expects at least one children constraint to be present
 * Fails on error
 *
 * @class BinaryLogic
 * @constructor
 */
var BinaryLogic = function (logictest, logicname, constraints, required) {
    this.constraints = constraints;
    this.logictest = logictest;
    this.logicname = logicname;

    var key = '(' + constraints.map(function (constraint) {
        return constraint.key;
    }).filter(function (item) {
        return item;
    }).join(' ' + this.logicname  + ' ') + ')';

    Abstract.call(this, key, required);
};

BinaryLogic.prototype = new Abstract();
BinaryLogic.prototype.constructor = Abstract;

BinaryLogic.prototype.doc = function () {
    return this.logicname;
};


BinaryLogic.prototype.checkPresentConstraints = function (validator, constraints, presents, cb) {
    var that = this;

    if (constraints.length === 0) {
        return cb(presents);
    }

    var rule = constraints.pop();

    return rule.present(validator, function (present) {
        if (present == true) {
            presents++;
        }

        return that.checkPresentConstraints(validator, constraints, presents, cb);
    });
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
BinaryLogic.prototype.present = function (validator, cb) {
    var that = this;
    var logicValidator = new LifeValidator(validator.context, that.constraints);

    return that.checkPresentConstraints(logicValidator, that.constraints.slice(), 0, function (presents) {
        that.constraints.reverse().forEach(function (item) {
            validator.validateRules.unshift(item);
            validator.sanitizeRules.unshift(item);
        });

        return cb(that.logictest(that.constraints, presents));
    });
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
    return cb();
};

module.exports = BinaryLogic;