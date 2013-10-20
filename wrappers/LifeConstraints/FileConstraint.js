var _ = require('lodash'),
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    File = require('../file.js'),
    http = require('http'),
    https = require('https'),
    Errors = require('./Errors.js'),
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
var FileConstraint = function (key, required, options) {
    Abstract.call(this, key, required);

    this.options = {
        allow_http: true
    };

    _.merge(this.options, options);
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
    return cb((validator.files[this.key] !== undefined &&
        validator.files[this.key].size > 0) ||
        (this.options.allow_http &&
            validator.data[this.key] !== undefined));
};

FileConstraint.prototype.validate_internal = function (validator, cb) {
    if (this.nextConstraint) {
        return this.nextConstraint.validate(validator, cb);
    }

    return cb();
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
    var that = this;

    if (that.options.allow_http && validator.data[that.key] !== undefined) {
        var file_url = validator.data[that.key];
        var http_libs = {'http:': http, 'https:': https};

        var http_lib = http_libs[url.parse(file_url).protocol];
        if (!http_lib) {
            validator.errors.push(new LifeErrors.NotFound(file_url));
            return cb();
        }

        var file_name = '';
        for (var i = 0; i < 32; i++) {
            file_name += Math.floor(Math.random() * 16).toString(16);
        }

        file_name += path.extname(file_url).replace(/(\.[a-z0-9]+).*/, '$1');

        var file = new File({
            path: path.join(LifeConfig.dir_uploaded, file_name),
            name: file_name
        });

        file.open();

        return http_lib.get(file_url, function (response) {
            response.on('data', function (buffer) {
                file.write(buffer, function () {});
            });

            response.on('end', function () {
                file.end(function () {
                    validator.files[that.key] = file;
                    return that.validate_internal(validator, cb);
                });
            });
        });
    }

    return that.validate_internal(validator, cb);
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
    var filename = validator.files[that.key].name;

    if (validator.context.user()) {
        filename = validator.context.user().id + '-' + filename;
    }

    var file_path = path.join(LifeConfig.dir_uploaded, filename);

    return fs.stat(validator.files[this.key].path, function (err, infos) {
        return fs.rename(validator.files[that.key].path, file_path, function (err) {
            if (err) {
                validator.errors.push(new Errors.UploadError());
                return cb();
            }

            validator.files[that.key].path = file_path;
            validator.output[that.key] = validator.files[that.key];

            return cb();
        });
    });
};

module.exports = FileConstraint;