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
 * @param {String} lang
 * @param {Object} strings
 * @function
 */
LifeData.i18nPicker = function (strings, lang) {
    lang = lang || 'en-US';

    var i,
        user_lang = lang.match(/^[a-z]{2}/)[0],
        string_user_lang = null,
        string_en_us = null,
        string_en = null,
        string = null;

    for (i in strings) {
        if (strings.hasOwnProperty(i)) {
            if (i === lang) {
                return strings[i];
            }

            if (!string_user_lang && i.substring(0, 2) === user_lang) {
                string_user_lang = strings[i];
            } else if (i === 'en_US') {
                string_en_us = strings[i];
            } else if (!string_en && i.substring(0, 2) === 'en') {
                string_en = strings[i];
            } else {
                string = strings[i];
            }
        }
    }

    return string_user_lang ||
        string_en_us ||
        string_en ||
        string;
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
        (item && item.toString && item.toString().match(/[0-9a-fA-F]{24}/)));
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
