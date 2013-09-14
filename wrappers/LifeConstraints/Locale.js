var RegExpConstraint = require('./RegExpConstraint.js');

/**
 * Locale class for constraints
 *
 * @class Locale
 * @constructor
 */
var Locale = function (key, required) {
    RegExpConstraint.call(this, /^[a-z]{2}(-[A-Z]{2})?$/, key, required);
};

Locale.prototype = new RegExpConstraint();
Locale.prototype.constructor = RegExpConstraint;

Locale.prototype.addon = function () {
    return 'A valid locale (eg. fr or en-US)';
};

module.exports = Locale;