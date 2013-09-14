var DateTime = require('./DateTime.js');

/**
 * DateConstraint class for constraints
 *
 * @class DateConstraint
 * @constructor
 */
var DateConstraint = function (key, required) {
    DateTime.call(this, key, required);
};

DateConstraint.prototype = new DateTime();
DateConstraint.prototype.constructor = DateTime;

DateConstraint.prototype.doc = function () {
    return 'Date';
};

module.exports = DateConstraint;