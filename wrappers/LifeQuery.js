var mongoose = require('mongoose'),
    LifeErrors = require('./LifeErrors.js'),
    LifeResponse = require('./LifeResponse.js');

/**
 * An utility class that performs queries on MongoDB
 * and handles errors returned by mongoosejs.
 *
 * @class LifeQuery
 * @param {Object} model Mongoose model to be used
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @param {Function} next Error handling function
 * @param {Object} [query] Default query parameters
 * @constructor
 */
var LifeQuery = function (model, req, res, next, query) {
    var filter;

    this.model = model;

    this.req = req !== undefined ? req : null;
    this.res = res !== undefined ? res : null;
    this.next = (next !== undefined && next !== null) ?
              next
            : function () {};
    this._query =
              typeof query === 'function' ? query
            : (query !== null && typeof query === 'object') ? model.find(query)
            : model.find();
    this._limit = this.req && this.req.query.limit ? this.req.query.limit
        : this.model.queryDefaults().limit;
    this._index = this.req && this.req.query.index ? this.req.query.index
        : this.model.queryDefaults().index;

    this._limit = parseInt(this._limit, 10);
    this._index = parseInt(this._index, 10);
    this._populate = this.model.queryDefaults().populate;
    this._sort = this.model.queryDefaults().sort || 'creation';

    if (model && model.queries) {
        for (filter in model.queries) {
            if (model.queries.hasOwnProperty(filter)) {
                this[filter] = model.queries[filter];
            }
        }
    }

    return this;
};

/**
 * Execute query, if no callback is provided data is returned to the client
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.exec = function (cb) {
    var that = this;

    return that._query.count(function (err, count) {
        that._query.limit(that._limit);
        that._query.skip(that._index);
        that._query.populate(that._populate);
        that._query.sort(that._sort);

        that._query.find();

        that._query.exec(function (err, data) {
            if (err) {
                console.error(err);
                return that.next(LifeErrors.IOErrorDB);
            }

            if (typeof cb === 'function') {
                return cb(data, count);
            }

            return new LifeResponse(that.req, that.res)
                .list(data, count, null, that);
        });
    });
};

/**
 * Execute query, if no callback is provided data is returned to the client.
 * Expects a single result.
 *
 * @param {boolean} [allow_empty=false] Is empty a suitable result
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.execOne = function (allow_empty, cb) {
    var that = this;

    cb = typeof allow_empty === 'function' ? allow_empty : cb;
    allow_empty = allow_empty === undefined ? false : allow_empty;
    allow_empty = typeof allow_empty === 'function' ? false : allow_empty;

    that._query.populate(that._populate);
    that._query.sort(that._sort);

    that._query.find(function (err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (data.length === 0) {
            if (!allow_empty) {
                return that.next(LifeErrors.NotFound);
            }

            data = [null];

        } else if (data.length !== 1) {
            return that.next(LifeErrors.NonUniqueResult);
        }

        if (typeof cb === 'function') {
            return cb(data[0]);
        }

        return new LifeResponse(that.req, that.res).single(data[0]);
    });
};

/**
 * Execute query, remove results from database. Returns number of removed
 * documents. If no callback is provided data is returned to the client.
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.remove = function (cb) {
    var that = this;

    that._query.populate(that._populate);
    that._query.sort(that._sort);

    that._query.remove(function (err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === 'function') {
            return cb(data);
        }

        return new LifeResponse(that.req, that.res).single(data);
    });
};

/**
 * Delete an existing item
 *
 * @param {Object} item Item to remove
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.purge = function (item, cb) {
    var that = this;

    item.remove(function (err) {
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
 * Save a new item or changes to an existing item
 *
 * @param {Object} item Item to save
 * @param {Object} [data={}] Data to merge inside item
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.save = function (item, data, cb) {
    var that = this;
    var i;

    cb = (typeof data === 'function') ? data : cb;
    data = (typeof data !== 'object') ? {} : data;
    item = (item === null || typeof item !== 'object') ? {} : item;

    for (i in data) {
        if (data.hasOwnProperty(i)) {
            item[i] = data[i];
        }
    }

    if (!(item instanceof mongoose.Document)) {
        item = new that.model(item);
    }

    return item.save(function (err) {
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
 * Execute query, remove results from database. Returns number of removed
 * documents. If no callback is provided data is returned to the client.
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.value = function (field, value) {
    if (this.req && value === undefined &&
            this.req.query[field] !== undefined) {
        return this.req.query[field];
    }

    return value;
};


['equals', 'in', 'gt', 'lt', 'gte', 'lte',
    'slice', 'ne', 'nin', 'size', 'all'].forEach(function (operation) {
    LifeQuery.prototype[operation] = function (field, value) {
        value = this.value(field, value);

        if (value !== undefined) {
            this._query.where(field)[operation](value);
        }

        return this;
    };
});

['and', 'or', 'nor', 'sort'].forEach(function (operation) {
    LifeQuery.prototype[operation] = function (value) {
        this._query[operation](value);

        return this;
    };
});

/**
 * Change a private property value.
 *
 * @param {string} property Property name.
 * @param {*} val The new value
 * @method
 */
LifeQuery.prototype.changeValue = function (property, val) {
    this['_' + property] = val;
};

['query', 'limit', 'index', 'populate', 'sort'].forEach(function (property) {
    LifeQuery.prototype[property] = function (val) {
        if (val === undefined) {
            return this['_' + property];
        }

        this.changeValue(property, val);
        return this;
    };
});

module.exports = LifeQuery;