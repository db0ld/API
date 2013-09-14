var MinLength = require('./MinLength.js'),
    bcrypt = require('bcryptjs');

/**
 * Password class for constraints
 *
 * @class Password
 * @constructor
 */
var Password = function (min_length, key, required) {
    MinLength.call(this, min_length, key, required);
};

Password.prototype = new MinLength();
Password.prototype.constructor = MinLength;

Password.prototype.sanitize = function (validator, cb) {
    var that = this;

    return bcrypt.hash(validator.data[that.key], 8, function (err, hash) {
        validator.output[that.key] = hash;

        return cb();
    });
};

module.exports = Password;