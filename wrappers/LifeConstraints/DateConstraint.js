var DateTime = require('./DateTime.js'),
    Errors = require('./Errors.js');

/**
 * DateConstraint class for constraints
 *
 * @class DateConstraint
 * @constructor
 */
var DateConstraint = function (key, required) {
    // TODO: Replace this shitty regexp
    DateTime.call(this, key, required);
};

DateConstraint.prototype = new DateTime();
DateConstraint.prototype.constructor = DateTime;

DateConstraint.prototype.doc = function () {
    return 'Date';
};

module.exports = DateConstraint;