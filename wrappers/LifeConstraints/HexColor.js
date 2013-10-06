var RegExpConstraint = require('./RegExpConstraint.js');

/**
 * HexColor class for constraints
 *
 * @class HexColor
 * @constructor
 */
var HexColor = function (key, required) {
    RegExpConstraint.call(this, /^\#[0-9a-fA-F]{6}$/, key, required);
};

HexColor.prototype = new RegExpConstraint();
HexColor.prototype.constructor = RegExpConstraint;

HexColor.prototype.addon = function () {
    return 'A color using hexadecimal notation.';
};

module.exports = HexColor;