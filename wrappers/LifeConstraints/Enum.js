var LifeData = require('../LifeData.js'),
    RegExpConstraint = require('./RegExpConstraint.js');

/**
 * Enum class for constraints
 *
 * @class Enum
 * @constructor
 */
var Enum = function (enum_values, key, required) {
    this.enum_values = enum_values;

    var regexp = enum_values.map(function (value) {
        return LifeData.regexpEscape(value);
    }).join('|');


    RegExpConstraint.call(this, new RegExp(regexp), key, required);
};

Enum.prototype = new RegExpConstraint();
Enum.prototype.constructor = RegExpConstraint;

Enum.prototype.addon = function () {
    return '{' + this.enum_values.join(',') + '}';
};

module.exports = Enum;