var api_utils = require('../utils/api.js');
var api_params = require('../config.js');
var error_codes = require('../utils/error_codes.js');

var LifeQuery = function(query, req, res, next) {
    this.query = query;
    this.req = typeof req !== 'undefined' ? req : null;
    this.res = typeof res !== 'undefined' ? res : null;
    this.next = typeof next !== 'undefined' ? next : null;

    return this;
};

LifeQuery.fromModel = function(model, req, res, next) {
    return new LifeQuery(model.find(), req, res, next);
};

LifeQuery.prototype.paginate = function() {
    this.query.limit((this.req ? this.req.query.limit : api_params.def_limit) || api_params.def_limit);
    this.query.skip((this.req ? this.req.query.offset : api_params.def_offset) || api_params.def_offset);
    return this;
};

LifeQuery.prototype.exec = function(cb, options) {
    this.query.exec(function(err, data) {
        if (err) {
            console.error(err);
            this.next(error_codes.IOErrorDB);
        }

        /*if (typeof options == "object") {
            if (options.findOne) {
                if (data.length === 0) {
                    this.next(error_codes.NotFound);
                } else if (data.length > 1) {
                    this.next(error_codes.NotUnique);
                }

                data = data[0];
            }
        }*/

        if (typeof cb === "function")
            return cb(err, data);
    });
    return this;
};

LifeQuery.prototype.filterEquals = function (field, value) {
    if (this.req && typeof value === "undefined" &&
        typeof this.req.query[field] !== "undefined") {
        value = this.req.query[field];
    }

    if (typeof value !== "undefined") {
        this.query.where(field).equals(value);
    }

    return this;
};

LifeQuery.prototype.filterRegexp = function (field, regexp, enabled) {
    if (typeof enabled === "undefined") {
        enabled = true;
    }

    if (enabled) {
        this.query.where(field, regexp);
    }

    return this;
};

LifeQuery.prototype.getQuery = function() {
    return this.query;
};

LifeQuery.prototype.setQuery = function(query) {
    this.query = query;
    return this;
};

LifeQuery.save = function(item, cb, next) {
    item.save(function (err) {
        if (err) {
            return next(error_codes.IOErrorDB);
        }

        if (typeof cb === "function")
            return cb(err);
    });
};

LifeQuery.findById = function(model, id, cb, next) {
    return model.findById(id, function (err, item) {
        if (err) {
            console.error(err);
            return next(error_codes.IOErrorDB);
        }

        if (item === null) {
          return next(error_codes.NotFound);
        }

        return cb(err, item);
    });
};

module.exports = LifeQuery;