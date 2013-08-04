var RegExpConstraint = require('./RegExpConstraint.js'),
    Errors = require('./Errors.js');

/**
 * URL class for constraints
 *
 * @class URL
 * @constructor
 */
var URL = function (key, required) {
    RegExpConstraint.call(this, /^((https?|ftp):((\/\/)|(\\\\))+[\w\d:#@%\/;$()~_?\+-=\\\.&]*)$/, key, required);
};

URL.prototype = new RegExpConstraint();
URL.prototype.constructor = RegExpConstraint;

URL.prototype.addon = function () {
    return 'An URL.';
};

module.exports = URL;