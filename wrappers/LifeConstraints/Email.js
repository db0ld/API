var RegExpConstraint = require('./RegExpConstraint.js'),
    Errors = require('./Errors.js');

/**
 * Email class for constraints
 *
 * @class Email
 * @constructor
 */
var Email = function (key, required) {
    // TODO: Replace this shitty regexp
    RegExpConstraint.call(this, /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}\b/, key, required);
};

Email.prototype = new RegExpConstraint();
Email.prototype.constructor = RegExpConstraint;

Email.prototype.addon = function () {
    return 'E-mail address';
};

module.exports = Email;