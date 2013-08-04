var fs = require('fs'),
    crypto = require('crypto'),
    Abstract = require('./Abstract.js'),
    LifeErrors = require('../LifeErrors.js'),
    LifeConfig = require('../LifeConfig.js'),
    LifeValidator = require('../LifeValidator.js');

/**
 * FileConstraint class for constraints
 *
 * @class FileConstraint
 * @constructor
 */
var FileConstraint = function (key, required) {
    Abstract.call(this, key, required);
};

FileConstraint.prototype = new Abstract();
FileConstraint.prototype.constructor = Abstract;

FileConstraint.prototype.doc = function () {
    return 'File';
};

FileConstraint.prototype.addon = function () {
    return 'multipart/form-data is required to send files';
};

FileConstraint.prototype.present = function (validator, cb) {
    return cb(validator.files[this.key] !== undefined &&
        validator.files[this.key].size > 0);
};

FileConstraint.prototype.test = function (value, req, cb) {
    cb = typeof req === 'function' ? req : cb;
    req = typeof req === 'object' ? req : null;

    var data = {};
    data[this.key] = value;

    return new LifeValidator([this], req, cb.bind(this, false))
        .files(data)
        .validate(cb.bind(this, true));
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
FileConstraint.prototype.validate = function (validator, cb) {
    if (this.nextConstraint) {
        return this.nextConstraint.validate(validator, cb);
    }

    return cb();
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
FileConstraint.prototype.sanitize = function (validator, cb) {
    var that = this;
    var path = LifeConfig.dir_uploaded + '/';
    var filename = '';
    var extension = validator.files[that.key].name.split('.').pop();
    if (validator.req.user) {
        filename = filename + validator.req.user.id + '-';
    }

    filename = filename + crypto.createHash('md5')
        .update(Date.now() + validator.files[this.key].name).digest("hex");
    path = path + filename + '.' + extension;

    return fs.stat(validator.files[this.key].path, function (err, infos) {
        return fs.rename(validator.files[that.key].path, path, function (err) {
            if (err) {
                return validator.next(LifeErrors.UploadError);
            }

            validator.files[that.key].path = path;
            validator.output[that.key] = validator.files[that.key];

            return cb();
        });
    });
};

module.exports = FileConstraint;