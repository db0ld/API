var RegExpConstraint = require('./RegExpConstraint.js'),
    Errors = require('./Errors.js');

/**
 * Ipv4 class for constraints
 *
 * @class Ipv4
 * @constructor
 */
var Ipv4 = function (key, required) {
    RegExpConstraint.call(this, /(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])/, key, required);
};

Ipv4.prototype = new RegExpConstraint();
Ipv4.prototype.constructor = RegExpConstraint;

Ipv4.prototype.addon = function () {
    return 'An IPv4 using dot notation.';
};

module.exports = Ipv4;