var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeErrors = require('./LifeErrors.js');
var LifeQuery = require('./LifeQuery.js');
var LifeUpload = require('../wrappers/LifeUpload.js');

/**
 * An utility class that performs simple operations such as saving or deleting
 * documents and handles errors returned by mongoosejs.
 *
 * @class LifeData
 * @param {Object} model Mongoose model to be used
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @param {Function} next Error handling function
 * @constructor
 */
var LifeData = function(model, req, res, next) {
    this.model = model;
    this.res = res;
    this.req = req;
    this.next = next;

    return this;
};

/**
 * Save a new item or changes to an existing item
 *
 * @param {Object} item Item to save
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeData.prototype.save = function(item, cb) {
    var that = this;

    return item.save(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === 'function') {
            return cb(item);
        }

        return new LifeQuery(that.model, that.req, that.res).findById(item._id);
    });
};

/**
 * Delete an existing item
 *
 * @param {Object} item Item to remove
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeData.prototype.remove = function(item, cb) {
    var that = this;

    item.remove(function (err) {
        var LifeResponse = require('./LifeResponse.js');

        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === 'function') {
            return cb(item);
        }

        return new LifeResponse(that.req, that.res).single(item);
    });
};

/**
 * Save an existing or new document from request
 *
 * @param {Object} [item=null] Existing item to update
 * @param {Object} [validation=null] Whitelist rules to be applied
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeData.prototype.saveFromRequest = function(item, validation, cb) {
    var that = this;
    var saveItem = function(item) {
        if (!(item instanceof mongoose.Document)) {
            item = new that.model(item);
        }

        return that.save(item, function(item) {
            var LifeResponse = require('./LifeResponse.js');

            if (typeof cb !== 'undefined') {
                return cb(item, that.req, that.res, that.next);
            }

            return new LifeQuery(that.model, that.req, that.res)
                .findById(item._id);
        }, that.next);
    };


    if (validation !== null && typeof validation == 'object') {
        return this.whitelist(validation, null, function(validated_item) {
            if (item === null || typeof item != 'object') {
                item = {};
            }

            for (var i in validated_item) {
                item[i] = validated_item[i];
            }

            return saveItem(item);
        });
    }

    return saveItem(that.requestToObject(item));
};

LifeData.prototype.mergeSave = function(item, data, cb) {
    var that = this;

    if (item === null || typeof item != 'object') {
        item = {};
    }

    for (var i in data) {
        item[i] = data[i];
    }

    if (!(item instanceof mongoose.Document)) {
        item = new that.model(item);
    }

    return this.save(item, function(item) {
        var LifeResponse = require('./LifeResponse.js');

        if (typeof cb !== 'undefined') {
            return cb(item, that.req, that.res, that.next);
        }

        return new LifeResponse(that.req, that.res).single(item);
    });
};

/**
 * Convert request to object
 *
 * @param {Object} [item=null] Existing item to update
 * @method
 */
LifeData.prototype.requestToObject = function(item) {
  return LifeData.requestToObject(this.req, this.model, item);
};


LifeData.prototype.objectIdsRec = function(whitelisted, parameters, validation, cb) {
    var that = this;

    if (parameters.length === 0) {
        return this.uploads(whitelisted, validation, cb);
    }

    var parameter = parameters.pop();

    var type = validation[parameter].type;
    var required = typeof validation[parameter].required == 'boolean' ?
                  validation[parameter].required
                : true;

    if (typeof that.req.body === 'undefined' ||
        (typeof that.req.body[parameter] === 'undefined' &&
         typeof that.req.body[parameter + '_id'] === 'undefined')) {
        if (required) {
            return that.next(LifeErrors.InvalidParameters);
        } else {
            return that.objectIdsRec(whitelisted, parameters, validation, cb);
        }
    }

    return new LifeQuery(type, this.req, this.res, this.next)
        .findById(that.req.body[parameter] || that.req.body[parameter + '_id'], function(item) {
            if (!item) {
                return that.next(LifeErrors.InvalidParameters);
            }

            whitelisted[parameter] = item;

            return that.objectIdsRec(whitelisted, parameters, validation, cb);
    });
};

LifeData.prototype.objectIds = function(whitelisted, validation, cb) {
    var parameters = [];

    for (var i in validation) {
        if (typeof validation[i].type == 'function' &&
            new validation[i].type() instanceof mongoose.Document) {
            parameters.push(i);
        }
    }

    return this.objectIdsRec(whitelisted, parameters, validation, cb);
};

LifeData.prototype.uploadsRec = function(whitelisted, files, validation, cb) {
    var that = this;

    if (files.length === 0) {
        return cb(whitelisted);
    }

    var file = files.pop();
    var path = '';

    if (that.req.user) {
        path += that.req.user.id + '-';
    }

    path += Date.now();

    var required = typeof validation[file].required == 'boolean' ?
                      validation[file].required
                    : true;

    if (typeof that.req.files === 'undefined' ||
        typeof that.req.files[file] === 'undefined') {
        if (required) {
            return that.next(LifeErrors.UploadMissingFile);
        } else {
            return that.uploadsRec(whitelisted, files, validation, cb);
        }
    }

    return validation[file].type.upload(that.req, that.res, that.next, file, path, function(uploaded) {
        whitelisted[file] = uploaded;

        return that.uploadsRec(whitelisted, files, validation, cb);
    });
};

/**
 * Private function to handle uploads
 *
 * @callback
 */
LifeData.prototype.uploads = function(whitelisted, validation, cb) {
    var files = [];

    for (var i in validation) {
        if (validation[i].type instanceof LifeUpload) {
            files.push(i);
        }
    }

    if (files.length > 0) {
        return this.uploadsRec(whitelisted, files, validation, cb);
    }

    return cb(whitelisted);
};

/**
 * Convert request to object
 *
 * @param {Object} [item=null] Existing item to update
 * @method
 */
LifeData.prototype.whitelist = function(validation, input, cb) {
    var ret = {};
    var errors = [];
    var i;

    var checkString = function(i) {
        if (inputVal instanceof String) {
            ret[i] = inputVal;
            return;
        } else if (typeof inputVal !== 'undefined' &&
                typeof inputVal.toString === 'function') {
            ret[i] = inputVal.toString();
            return;
        }
    };

    if (input === null || typeof input !== 'object') {
        if (this.req.route.method == 'post' || this.req.route.method == 'put') {
            input = this.req.body;
        } else {
            input = this.req.query;
        }
    }

    for (i in validation) {
        var valueType = validation[i].type;

        if (valueType instanceof LifeData.ExtRegExp) {
            valueType = valueType.regexp();
        }

        var required = typeof validation[i].required == 'boolean' ?
              validation[i].required
            : true;
        inputVal = input[i];
        error = false;

        if (valueType == Number) {
            ret[i] = parseFloat(inputVal);

            if (isNaN(ret[i])) {
                error = true;
            }

        } else if (valueType == String) {
            checkString(i);
        } else if (valueType == Date) {
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
            checkString(i);

            if (typeof ret[i] === 'string' && !ret[i].match(valueType)) {
                error = true;
            }

        } else if (!(typeof valueType == 'function' && new valueType() instanceof mongoose.Document) &&
                !(valueType instanceof LifeUpload)) {
            ret[i] = inputVal;
        } else {
            required = false;
        }

        if (error || (required && typeof ret[i] === 'undefined')) {
            errors.push(i);
        }
    }

    if (errors.length) {
        var error = {};

        for (i in LifeErrors.InvalidParameters) {
            error[i] = LifeErrors.InvalidParameters[i];
        }

        error.message += ' (' + errors.join() + ')';
        return this.next(error);
    }

    return this.objectIds(ret, validation, cb);
};

/**
 * Convert request to object
 *
 * @param {Object} req ExpressJS request
 * @param {Object} model Mongoose base model
 * @param {Object} [data] Existing data
 * @function
 */
LifeData.requestToObject = function(req, model, data) {
    if (data === null || typeof data !== 'object') {
        data = {};
    }

    for (var label in model.schema.paths) {
        if (req.body[label]) {
            data[label] = req.body[label];
        }
    }

    return data;
};

/**
 * Get an internationalized string from a collection of strings
 *
 * @param {String} lang
 * @param {Object} strings
 * @function
 */
LifeData.i18nPicker = function(strings, lang) {
    if (!lang) {
        lang = 'en-US';
    }

    var user_lang = lang.match(/^[a-z]{2}/)[0];
    var string_user_lang = null;
    var string_en_us = null;
    var string_en = null;
    var string = null;

    for (var i in strings) {
        if (i == lang) {
            return strings[i];
        } else if (!string_user_lang && i.substring(0, 2) === user_lang) {
            string_user_lang = strings[i];
        } else if (i == 'en_US') {
            string_en_us = strings[i];
        } else if (!string_en && i.substring(0, 2) == 'en') {
            string_en = strings[i];
        } else {
            string = strings[i];
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
 * @todo hexa check
 * @param {Object|String} item
 * @return boolean
 * @function
 */
LifeData.isObjectId = function(item) {
    return (item instanceof ObjectId ||
        (item && item.toString && item.toString().match(/[0-9a-fA-F]{24}/)));
};


LifeData.regexpEscape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Number padding
 *
 * @param {Number} num
 * @param {Number} numZeros
 * @static
 */
LifeData.zeroPad = function(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }

    return zeroString+n;
};

/**
 * Convert Date object to ISO date
 *
 * @param {Date} d
 * @returns String
 * @static
 */
LifeData.dateToString = function(d) {
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
LifeData.dateTimeToString = function(d) {
    return LifeData.dateToString(d) + 'T' +
      LifeData.zeroPad(d.getUTCHours(), 2) + ':' +
      LifeData.zeroPad(d.getUTCMinutes(), 2) + ':' +
      LifeData.zeroPad(d.getUTCSeconds(), 2) + 'Z';
};

LifeData.ExtRegExp = function() {};
LifeData.ExtRegExp.prototype.doc = function() {
    return '';
};
LifeData.ExtRegExp.prototype.addon = function() {
    return '';
};


LifeData.Email = function() {
};
LifeData.Email.prototype = new LifeData.ExtRegExp();
LifeData.Email.prototype.constructor = LifeData.ExtRegExp;
LifeData.Email.prototype.doc = function() {
    return 'E-Mail address';
};
LifeData.Email.prototype.addon = function() {
    return 'An e-mail address. No IDN allowed.';
};
LifeData.Email.prototype.regexp = function() {
    // TODO: update that shitty regexp
    return /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/;
};

LifeData.Enum = function(values) {
    this.values = values;

    values = values.map(function(value) {
        return LifeData.regexpEscape(value);
    }).join('|');

    RegExp.call(this, this.toString());
};
LifeData.Enum.prototype = new LifeData.ExtRegExp();
LifeData.Enum.prototype.constructor = RegExp;
LifeData.Enum.prototype.addon = function() {
    return '{"' + this.values.join('", "') + '"}';
};
LifeData.Enum.prototype.doc = function() {
    return 'Enum';
};
LifeData.Enum.prototype.regexp = function() {
    var values = this.values.map(function(value) {
        return LifeData.regexpEscape(value);
    }).join('|');

    return new RegExp('^' + values + '$');
};

LifeData.regexps = {
  'login': /^[a-zA-Z0-9-_]{3,20}$/,
  'name': /^[a-zA-Z0-9-._ ]+$/,
  'lang': /^[a-z]{2}(-[A-Z]{2})?$/,
  'email': new LifeData.Email(),
  'gender': new LifeData.Enum(['male', 'female', 'other', 'undefined']),
  'achievementState': new LifeData.Enum(['not_planned', 'planned',
        'in_progress', 'done'])
};

module.exports = LifeData;
