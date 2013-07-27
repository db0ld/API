var LifeData = require('./LifeData.js');

var LifeConstraint = function () {
};

var ExtRegExp = function () {};

ExtRegExp.prototype.doc = function () {
    return '';
};

ExtRegExp.prototype.addon = function () {
    return '';
};


var Email = function () {
};

Email.prototype = new ExtRegExp();

Email.prototype.constructor = ExtRegExp;

Email.prototype.doc = function () {
    return 'E-Mail address';
};

Email.prototype.addon = function () {
    return 'An e-mail address. No IDN allowed.';
};

Email.prototype.regexp = function () {
    // TODO: update that shitty regexp
    return (/\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}\b/);
};

var Enum = function (values) {
    this.values = values;

    values = values.map(function (value) {
        return LifeData.regexpEscape(value);
    }).join('|');

    RegExp.call(this, this.toString());
};

Enum.prototype = new ExtRegExp();

Enum.prototype.constructor = ExtRegExp;

Enum.prototype.addon = function () {
    return '{"' + this.values.join('", "') + '"}';
};

Enum.prototype.doc = function () {
    return 'Enum';
};

Enum.prototype.regexp = function () {
    var values = this.values.map(function (value) {
        return LifeData.regexpEscape(value);
    }).join('|');

    return new RegExp('^' + values + '$');
};

LifeConstraint.regexps = {
    'login': /^[a-zA-Z0-9\-_]{3,20}$/,
    'name': /^[a-zA-Z0-9\-\._ ]+$/,
    'lang': /^[a-z]{2}(-[A-Z]{2})?$/,
    'email': new Email(),
    'gender': new Enum(['male', 'female', 'other', 'undefined']),
    'achievementState': new Enum(['not_planned', 'planned', 'in_progress', 'done'])
};

LifeConstraint.ExtRegExp = ExtRegExp;
LifeConstraint.Enum = Enum;
LifeConstraint.Email = Email;

module.exports = LifeConstraint;
