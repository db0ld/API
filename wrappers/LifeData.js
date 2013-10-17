var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * An utility class that performs simple data related operations.
 *
 * @class LifeData
 * @constructor
 */
var LifeData = function () {};

/**
 * Get an internationalized string from a collection of strings
 *
 * User locale, user language, US English, English, first language available
 *
 * @param {String} locale
 * @param {Object} strings
 * @function
 */
LifeData.i18nPicker = function (strings, locale) {
    var candidate = null;
    var lang = locale.substring(0, 2);

    for (var i = strings.length - 1; i >= 0; i--) {
        if (strings[i].locale == locale) {
            return strings[i].string;
        }

        if (strings[i].locale.substring(0, 2) == lang) {
            candidate = strings[i].string;
        }
    };

    return candidate || (strings[0] && strings[0].string) || '';
};

/**
 * Check whenever something can be converted to an ObjectId
 *
 * @param {Object|String} item
 * @return boolean
 * @function
 */
LifeData.isObjectId = function (item) {
    return (item instanceof ObjectId ||
            item instanceof mongoose.Document ||
        (item && item.toString && item.toString().match(/^[0-9a-fA-F]{24}$/)));
};

/**
 * Escape a string to be included in RegExp
 *
 * @param {String} s
 * @return String
 * @function
 */
LifeData.regexpEscape = function (s) {
    return s.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
};

/**
 * Number padding
 *
 * @param {Number} num
 * @param {Number} numZeros
 * @static
 */
LifeData.zeroPad = function (num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
        zeroString = '-' + zeroString;
    }

    return zeroString + n;
};

/**
 * Convert Date object to ISO date
 *
 * @param {Date} d
 * @returns String
 * @static
 */
LifeData.dateToString = function (d) {
    return LifeData.zeroPad(d.getUTCFullYear(), 4) + '-' +
        LifeData.zeroPad(d.getUTCMonth() + 1, 2) + '-' +
        LifeData.zeroPad(d.getUTCDate(), 2);
};

/**
 * Convert Date object to ISO time
 *
 * @param {Date} d
 * @returns String
 * @static
 */
LifeData.dateTimeToString = function (d) {
    return LifeData.dateToString(d) + 'T' +
        LifeData.zeroPad(d.getUTCHours(), 2) + ':' +
        LifeData.zeroPad(d.getUTCMinutes(), 2) + ':' +
        LifeData.zeroPad(d.getUTCSeconds(), 2) + 'Z';
};

module.exports = LifeData;
