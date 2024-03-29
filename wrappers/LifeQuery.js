var mongoose = require('mongoose'),
    LifeErrors = require('./LifeErrors.js');

/**
 * An utility class that performs queries on MongoDB
 * and handles errors returned by mongoosejs.
 *
 * @class LifeQuery
 * @param {Object} model Mongoose model to be used
 * @param {LifeContext} context Request context
 * @param {Object} [query] Default query parameters
 * @constructor
 */
var LifeQuery = function (model, context, query) {
    var filter;

    this.model = model;
    this.context = context;

    this._query =
              typeof query === 'function' ? query
            : (query !== null && typeof query === 'object') ? model.find(query)
            : model.find();
    this._limit = this.context.query('limit', this.model.queryDefaults.limit);
    this._index = this.context.query('index', this.model.queryDefaults.index);

    this._limit = parseInt(this._limit, 10);
    this._index = parseInt(this._index, 10);
    this._select = {};

    this._populate = this.model.queryDefaults.populate;
    this._sort = this.model.queryDefaults.sort || 'creation';

    if (model && model.queries) {
        for (filter in model.queries) {
            if (model.queries.hasOwnProperty(filter)) {
                this[filter] = model.queries[filter].bind(this);
            }
        }
    }

    return this;
};

/**
 * Count results from query, if no callback is provided data is returned
 * to the client
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.count = function (cb) {
    var that = this;

    return that._query.count(function (err, count) {
        if (err) {
            console.error(err);
            return that.context.send.error(new LifeErrors.IOErrorDB());
        }

        if (typeof cb === 'function') {
            return cb.call(that, count);
        }

        return that.context.send.single(count);
    });
};

/**
 * Execute query, if no callback is provided data is returned to the client
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.exec = function (cb) {
    var that = this;

    return that.count(function (count) {
        if (that._limit !== null && that._index !== null) {
            that._query.limit(that._limit);
            that._query.skip(that._index);
        }

        that._query.populate(that._populate);
        that._query.sort(that._sort);
        this._query.select(that._select);

        that._query.find();

        that._query.exec(function (err, data) {
            if (err) {
                console.error(err);
                return that.context.send.error(new LifeErrors.IOErrorDB());
            }

            if (typeof cb === 'function') {
                return cb.call(that, data, count);
            }

            return that.context.send.list(data, count, that);
        });
    });
};

/**
 * Execute query, if no callback is provided data is returned to the client.
 * Expects a single result, but can be overridden
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
            return that.context.send.error(new LifeErrors.IOErrorDB());
        }

        if (data.length === 0) {
            if (!allow_empty) {
                return that.context.send.error(new LifeErrors.NotFound());
            }

            data = [null];

        } else if (data.length !== 1) {
            return that.context.send.error(new LifeErrors.NonUniqueResult());
        }

        if (typeof cb === 'function') {
            return cb.call(that, data[0]);
        }

        return that.context.send.single(data[0]);
    });
};

/**
 * Execute query, remove results from database. Returns number of removed
 * documents. If no callback is provided removed count is returned to the
 * client.
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
            return that.single.send.error(new LifeErrors.IOErrorDB());
        }

        if (typeof cb === 'function') {
            return cb.call(that, data);
        }

        return that.context.send.single(data);
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
            console.error(err);
            return that.single.send.error(new LifeErrors.IOErrorDB());
        }

        if (typeof cb === 'function') {
            return cb.call(that, item);
        }

        return that.context.send.single(item);
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
            console.error(err);
            return that.context.send.error(new LifeErrors.IOErrorDB());
        }

        if (typeof cb === 'function') {
            return cb.call(that, item);
        }

        return that.context.send.single(item);
    });
};

/**
 * Applies filters based on current request GET parameters to query
 *
 * @param {Array} filters
 * @method
 */
LifeQuery.prototype.filters = function (filters) {
    var that = this;

    if (filters === undefined) {
        filters = that.context.filters();
    }

    for (var filter in filters) {
        filter = filters[filter];
        var value = that.context.query(filter.key, null);

        if (value !== null) {
            filter.filter.call(that, value);
        }
    };

    return this;
};

/**
 * Get or set current populate value for current query
 *
 * @param {*} val New value
 */
LifeQuery.prototype.populate = function (val) {
    if (val === undefined) {
        return this._populate;
    }

    this._populate = val;
    return this;
};

/**
 * Get or set current limit value for current query
 *
 * @param {*} val New value
 */
LifeQuery.prototype.limit = function (val) {
    if (val === undefined) {
        return this._limit;
    }

    this._limit = val;
    return this;
};

/**
 * Get or set current limit value for current query
 *
 * @param {*} val New value
 */
LifeQuery.prototype.select = function (val) {
    if (val === undefined) {
        return this._select;
    }

    this._select = val;
    return this;
};

/**
 * Get or set current index value for current query
 *
 * @param {*} val New value
 */
LifeQuery.prototype.index = function (val) {
    if (val === undefined) {
        return this._index;
    }

    this._index = val;
    return this;
};

module.exports = LifeQuery;