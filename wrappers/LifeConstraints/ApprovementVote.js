var Enum = require('./Enum.js');

/**
 * ApprovementVote. class for constraints
 *
 * @class ApprovementVote.
 * @constructor
 */
var ApprovementVote = function (key, required) {
    Enum.call(this, ['approved', 'disapproved'], key, required);
};

ApprovementVote.prototype = new Enum([]);
ApprovementVote.prototype.constructor = Enum;

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
ApprovementVote.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = validator.data[this.key] == 'approved' ? 1 : -1;

    return cb();
};

module.exports = ApprovementVote;