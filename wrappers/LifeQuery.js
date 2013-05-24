var LifeErrors = require('./LifeErrors.js');
var LifeResponse = require('./LifeResponse.js');

var LifeQuery = function(model, req, res, next, query) {
    this.model = model;

    this.req = typeof req !== 'undefined' ? req : null;
    this.res = typeof res !== 'undefined' ? res : null;
    this.next = typeof next !== 'undefined' ? next : function() {};
    this._query =
              typeof query == 'function' ? query
            : typeof query == 'object' ? model.find(query)
            : model.find();
    this._limit = (this.req && this.req.query.limit ? this.req.query.limit : this.model.queryDefaults().limit);
    this._offset = (this.req && this.req.query.offset ? this.req.query.offset : this.model.queryDefaults().offset);
    this._populate = this.model.queryDefaults().populate;

    return this;
};

LifeQuery.prototype.exec = function(cb) {
    var that = this;

    return that._query.count(function (err, count) {
        that._query.limit(that._limit);
        that._query.skip(that._offset);
        that._query.populate(that._populate);

        that._query.find();

        that._query.exec(function(err, data) {
            if (err) {
                console.error(err);
                return that.next(LifeErrors.IOErrorDB);
            }

            if (typeof cb === "function") {
                return cb(data, count);
            }

            return LifeResponse.sendList(that.req, that.res, data, count, null, that);
        });
    });
};

LifeQuery.prototype.execOne = function(allow_empty, cb) {
    var that = this;

    allow_empty = typeof allow_empty === 'undefined' ? false : allow_empty;

    that._query.populate(that._populate);

    that._query.find(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (data.length === 0) {
            if (!allow_empty) {
                return that.next(LifeErrors.NotFound);
            } else {
                data = [null];
            }
        } else if (data.length !== 1) {
            return that.next(LifeErrors.NonUniqueResult);
        }

        if (typeof cb === "function") {
            return cb(data[0]);
        }

        return LifeResponse.send(that.req, that.res, data[0]);
    });
};

LifeQuery.prototype.remove = function(cb) {
    var that = this;

    that._query.populate(that._populate);

    that._query.remove(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(data);
        }

        return LifeResponse.send(that.req, that.res, data);
    });
};

LifeQuery.value = function(value) {
    if (this.req && typeof value === "undefined" &&
        typeof this.req.query[field] !== "undefined") {
        return this.req.query[field];
    }

    return value;
};

LifeQuery.prototype.filterEquals = function (field, value) {
    value = LifeQuery.value(field);

    if (typeof LifeQuery.value() !== "undefined") {
        this._query.where(field).equals(value);
    }

    return this;
};



['equals', 'in', 'gt', 'lt', 'gte', 'lte', 'slice', 'ne', 'nin', 'size', 'all'].forEach(function(operation) {
    LifeQuery.prototype[operation] = function(field, value) {
        value = LifeQuery.value(value);

        if (typeof value !== "undefined") {
            this._query.where(field)[operation](value);
        }

        return this;
    };
});

['and', 'or', 'nor', 'sort'].forEach(function(operation) {
    LifeQuery.prototype[operation] = function(value) {
        this._query[operation](value);

        return this;
    };
});

LifeQuery.prototype.filterRegexp = function (field, regexp, enabled) {
    if (typeof enabled === "undefined") {
        enabled = true;
    }

    if (enabled) {
        this._query.where(field, regexp);
    }

    return this;
};

LifeQuery.prototype.changeValue = function(property, val) {
    this['_' + property] = val;
};

LifeQuery.prototype.findById = function(id, cb) {
    this.query(this.model.find({'_id': id}));

    return this.execOne(true, cb);
};

LifeQuery.prototype.modelStatic = function(item) {
    var args = [this];

    for (var i in arguments) {
        if (i != '0') {
            args.push(arguments[i]);
        }
    }

    return this.model[item].apply(this, args);
};

['query', 'limit', 'offset', 'populate'].forEach(function (property) {
    LifeQuery.prototype[property] = function(val) {
        if (typeof val === "undefined") {
            return this['_' + property];
        }

        this.changeValue(property, val);
        return this;
    };
});

module.exports = LifeQuery;