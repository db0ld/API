var mongoose = require('mongoose'),
    LifeErrors = require('./LifeErrors.js'),
    LifeQuery = require('./LifeQuery.js'),
    LifeUpload = require('./LifeUpload.js'),
    LifeConstraint = require('./LifeConstraint.js');

/**
 * An utility class that performs simple operations such as saving or deleting
 * documents and handles errors returned by mongoosejs.
 *
 * @class LifeValidation
 * @param {Object} model Mongoose model to be used
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @param {Function} next Error handling function
 * @constructor
 */
var LifeValidation = function (model, req, res, next) {
    this.model = model;
    this.res = res;
    this.req = req;
    this.next = next;

    return this;
};

LifeValidation.prototype.objIdsRec = function (whitelisted, params, valid, cb) {
    if (params.length === 0) {
        return this.uploads(whitelisted, valid, cb);
    }


    var that = this,
        param = params.pop(),
        type = valid[param].type,
        required = typeof valid[param].required === 'boolean' ?
                  valid[param].required
                : true;

    if (that.req.body === undefined ||
            (that.req.body[param] === undefined &&
             that.req.body[param + '_id'] === undefined)) {
        if (required) {
            return that.next(LifeErrors.InvalidParameters);
        }

        return that.objIdsRec(whitelisted, params, valid, cb);
    }

    return new LifeQuery(type, this.req, this.res, this.next)
        .findById(that.req.body[param] ||
            that.req.body[param + '_id'], function (item) {
                if (!item) {
                    return that.next(LifeErrors.InvalidParameters);
                }

                whitelisted[param] = item;

                return that.objIdsRec(whitelisted, params, valid, cb);
            });
};

LifeValidation.prototype.objectIds = function (whitelisted, valid, cb) {
    var parameters = [],
        i;

    for (i in valid) {
        if (valid.hasOwnProperty(i) &&
                typeof valid[i].type === 'function' &&
                new valid[i].type() instanceof mongoose.Document) {
            parameters.push(i);
        }
    }

    return this.objIdsRec(whitelisted, parameters, valid, cb);
};

LifeValidation.prototype.uploadsRec = function (whitelisted, files, valid, cb) {
    if (files.length === 0) {
        return cb(whitelisted);
    }

    var that = this,
        file = files.pop(),
        path = (that.req.user ? that.req.user.id + '-' : '') +
            Date.now(),
        required = typeof valid[file].required === 'boolean' ?
                      valid[file].required
                    : true;

    if (that.req.files === undefined ||
            that.req.files[file] === undefined) {
        if (required) {
            return that.next(LifeErrors.UploadMissingFile);
        }

        return that.uploadsRec(whitelisted, files, valid, cb);
    }

    return valid[file].type.upload(that.req, that.res, that.next, file,
        path, function (uploaded) {
            whitelisted[file] = uploaded;

            return that.uploadsRec(whitelisted, files, valid, cb);
        });
};

/**
 * Private function to handle uploads
 *
 * @callback
 */
LifeValidation.prototype.uploads = function (whitelisted, valid, cb) {
    var files = [],
        i;

    for (i in valid) {
        if (valid.hasOwnProperty(i) &&
                valid[i].type instanceof LifeUpload) {
            files.push(i);
        }
    }

    if (files.length > 0) {
        return this.uploadsRec(whitelisted, files, valid, cb);
    }

    return cb(whitelisted);
};

/**
 * Convert request to object
 *
 * @param {Object} [item=null] Existing item to update
 * @method
 */
LifeValidation.prototype.whitelist = function (valid, input, cb) {
    var ret = {},
        errors = [],
        i;

    var checkString = function (inputVal, i) {
        if (inputVal instanceof String) {
            ret[i] = inputVal;
            return;
        }

        if (inputVal !== undefined &&
                typeof inputVal.toString === 'function') {
            ret[i] = inputVal.toString();
            return;
        }
    };

    if (input === null || typeof input !== 'object') {
        if (this.req.route.method === 'post' ||
                this.req.route.method === 'put') {
            input = this.req.body;
        } else {
            input = this.req.query;
        }
    }

    for (i in valid) {
        if (valid.hasOwnProperty(i)) {
            var valueType = valid[i].type;

            if (valueType instanceof LifeConstraint.ExtRegExp) {
                valueType = valueType.regexp();
            }

            var required = typeof valid[i].required === 'boolean' ?
                    valid[i].required : true;
            var inputVal = input[i];
            var error = false;

            if (valueType === Number) {
                ret[i] = parseFloat(inputVal);

                if (isNaN(ret[i])) {
                    error = true;
                }

            } else if (valueType === String) {
                checkString(inputVal, i);
            } else if (valueType === Date) {
                if (inputVal instanceof Date) {
                    ret[i] = inputVal;
                } else {
                    ret[i] = Date.parse(inputVal);
                    if (isNaN(ret[i])) {
                        if (required) {
                            error = true;
                        } else {
                            delete ret[i];
                        }
                    } else {
                        ret[i] = new Date(ret[i]);
                    }
                }

            } else if (valueType instanceof RegExp) {
                checkString(inputVal, i);

                if (typeof ret[i] === 'string' && !ret[i].match(valueType)) {
                    error = true;
                }

            } else if (!(typeof valueType === 'function' &&
                new valueType() instanceof mongoose.Document) &&
                    !(valueType instanceof LifeUpload)) {
                ret[i] = inputVal;
            } else {
                required = false;
            }

            if (error || (required && ret[i] === undefined)) {
                errors.push(i);
            }
        }
    }

    if (errors.length) {
        var ret_error = {};

        for (i in LifeErrors.InvalidParameters) {
            if (LifeErrors.InvalidParameters.hasOwnProperty(i)) {
                ret_error[i] = LifeErrors.InvalidParameters[i];
            }
        }

        ret_error.message += ' (' + errors.join() + ')';
        return this.next(ret_error);
    }

    return this.objectIds(ret, valid, cb);
};

module.exports = LifeValidation;
