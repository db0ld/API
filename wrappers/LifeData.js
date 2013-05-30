var mongoose = require('mongoose');
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

LifeData.prototype.saveFromRequest = function(item, validation, cb) {
    var that = this;

    if (validation !== null && typeof validation == 'object') {
        var validated_item = this.whitelist(validation);

        if (item === null || typeof item != 'object') {
            item = {};
        }

        for (var i in validated_item) {
            item[i] = validated_item[i];
        }

    } else {
        item = that.requestToObject(item);
    }

    if (!(item instanceof mongoose.Document)) {
        item = new that.model(item);
    }

    that.save(item, function(item) {
        if (typeof cb !== "undefined") {
            return cb(item, that.req, that.res, that.next);
        }

        return LifeResponse.send(that.req, that.res, item);
    }, that.next);
};

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

LifeData.prototype.requestToObject = function(data) {
  return LifeData.requestToObject(this.req, this.model, data);
};

LifeData.prototype.whitelist = function(validation, input) {
    var ret = {};
    var errors = [];

    var checkString = function(i) {
        if (inputVal instanceof String) {
            ret[i] = inputVal;
        } else if (typeof inputVal !== "undefined" && typeof inputVal.toString === 'function') {
            ret[i] = inputVal.toString();
        }
    };

    if (input === null || typeof input !== 'object') {
        if (this.req.route.method == 'post' || this.req.route.method == 'put') {
            input = this.req.body;
        } else {
            input = this.req.query;
        }
    }

    for (var i in validation) {
        valueType = validation[i].type;
        required = validation[i].required;
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
                    error = true;
                } else {
                    ret[i] = new Date(ret[i]);
                }
            }

        } else if (valueType instanceof RegExp) {
            checkString(i);

            if (typeof ret[i] === "string" && !ret[i].match(valueType)) {
                error = true;
            }

        } else {
            ret[i] = inputVal;
        }

        if (error || (required && typeof ret[i] === 'undefined')) {
            errors.push(i);
        }
    }

    if (errors.length) {
        var error = {};

        for (var i in LifeErrors.InvalidParameters) {
            error[i] = LifeErrors.InvalidParameters[i];
        }

        error.message += ' (' + errors.join() + ')';
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

LifeData.regexps = {
  'login': /^[a-zA-Z0-9-_]+$/,
  'email': /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/,
  'name': /^[a-zA-Z0-9-._ ]+$/,
  'gender': /^male|female|other$/,
  'lang': /^[a-z]{2}(-[A-Z]{2})?$/
};

module.exports = LifeData;