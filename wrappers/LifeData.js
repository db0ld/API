var LifeErrors = require('./LifeErrors.js');
var LifeResponse = require('./LifeResponse.js');
var LifeQuery = require('./LifeQuery.js');

var LifeData = function(model, req, res, next) {
    this.model = model;
    this.res = res;
    this.req = req;
    this.next = next;

    return this;
};

LifeData.prototype.save = function(item, cb) {
    var that = this;

    item.save(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(item);
        }

        return new LifeQuery(that.model, that.req, that.res).findById(item._id);
    });
};

LifeData.prototype.delete = function(item, cb) {
    var that = this;

    item.delete(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(item);
        }

        return LifeResponse.send(that.res, that.req, item);
    });
};

LifeData.prototype.saveFromRequest = function(item, cb) {
    var that = this;

    if (typeof item === 'undefined') {
        item = new that.model(that.requestToObject(item));
    } else {
        item = that.requestToObject(item);
    }

    that.save(item, function(item) {
        if (typeof cb !== "undefined") {
            return cb(item, that.req, that.res, that.next);
        }

        return LifeResponse.send(that.req, that.res, item);
    }, that.next);
};

LifeData.requestToObject = function(req, model, data) {
    if (typeof data !== 'object') {
        data = {};
    }

    for (var label in model.schema.paths) {
        if (req.body[label]) {
            data[label] = req.body[label];
        }
    }

    return data;
};

LifeData.prototype.requestToObject = function(data) {
  return LifeData.requestToObject(this.req, this.model, data);
};

LifeData.prototype.whitelist = function(method, values, mustBePresent) {
    var input = {};
    var ret = {};
    var whitelist_errors = [];
    mustBePresent = typeof mustBePresent == 'boolean' ? mustBePresent : false;

    var checkString = function(i) {
        if (input[i] instanceof String) {
            ret[i] = input[i];
        } else if (typeof input[i] !== "undefined" && typeof input[i].toString === 'function') {
            ret[i] = input[i].toString();
        }
    };

    if (typeof method === 'object') {
        input = method;
    } else if (method == 'POST' || method == 'PUT') {
        input = this.req.body;
    } else {
        input = this.req.query;
    }

    for (var i in values) {
        if (values[i] == Number) {
            ret[i] = parseFloat(input[i]);

            if (isNaN(ret[i])) {
                console.log(i + ' is not a number');
                error = true;
            }

        } else if (values[i] == String) {
            checkString(i);
        } else if (values[i] == Date) {
            if (input[i] instanceof Date) {
                ret[i] = input[i];
            } else {
                ret[i] = Date.parse(input[i]);
                if (isNaN(ret[i])) {
                    error = true;
                } else {
                    ret[i] = new Date(ret[i]);
                }
            }

        } else if (values[i] instanceof RegExp) {
            checkString(i);

            if (typeof ret[i] === "string" && !ret[i].match(values[i])) {
                error = true;
            }

        } else {
            ret[i] = input[i];
        }

        if (error || (mustBePresent && typeof ret[i] === 'undefined')) {
            whitelist_errors.push(i);
        }
    }

    if (whitelist_errors.length) {
        var error = {};

        for (var i in LifeErrors.InvalidParameters) {
            error[i] = LifeErrors.InvalidParameters[i];
        }

        error.message += ' (' + whitelist_errors.join() + ')';
        return this.next(error);
    }

    return ret;
};

LifeData.i18nPicker = function(lang, strings) {
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
        } else if (i == "en_US") {
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


module.exports = LifeData;