var LifeErrors = require('./LifeErrors.js');
var LifeConfig = require('./LifeConfig.js');
var LifeResponse = require('./LifeResponse.js');

var LifeQuery = function(query, req, res, next) {
    this.query = query;
    this.req = typeof req !== 'undefined' ? req : null;
    this.res = typeof res !== 'undefined' ? res : null;
    this.next = typeof next !== 'undefined' ? next : null;
    this.limit = null;
    this.offset = null;

    return this;
};

LifeQuery.fromModel = function(model, req, res, next) {
    return new LifeQuery(model.find(), req, res, next);
};

LifeQuery.prototype.paginate = function() {
    this.limit = (this.req && this.req.query.limit ? this.req.query.limit : LifeConfig.def_limit);
    this.offset = (this.req && this.req.query.offset ? this.req.query.offset : LifeConfig.def_offset);

    return this;
};

LifeQuery.prototype.execCount = function(count, cb) {
    this.query.limit(this.limit);
    this.query.skip(this.offset);
    this.query.find();

    this.query.exec(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(data, count);
        }

        console.log(data);

        return LifeResponse.sendList(that.req, that.res, data, count);
    });
};

LifeQuery.prototype.exec = function(cb) {
    var that = this;

    if (this.limit !== null) {
        return this.query.count(function (err, count) {
            return that.execCount(count, cb);
        });
    }

    this.query.exec(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(data);
        }

        return LifeResponse.sendList(that.req, that.res, data);
    });

    return this;
};

LifeQuery.prototype.execOne = function(cb) {
    var that = this;

    this.query.find(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (data.length === 0) {
            return that.next(LifeErrors.NotFound);
        } else if (data.length !== 1) {
            return that.next(LifeErrors.NonUniqueResult);
        }

        if (typeof cb === "function") {
            return cb(data[0]);
        }

        return LifeResponse.send(that.req, that.res, data[0]);
    });
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

module.exports = LifeQuery;