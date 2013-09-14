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
    this.limit = this.context.query('limit', this.model.queryDefaults.limit);
    this.index = this.context.query('index', this.model.queryDefaults.index);

    this.limit = parseInt(this.limit, 10);
    this.index = parseInt(this.index, 10);

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
 * Execute query, if no callback is provided data is returned to the client
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.exec = function (cb) {
    var that = this;

    return that._query.count(function (err, count) {
        that._query.limit(that.limit);
        that._query.skip(that.index);
        that._query.populate(that._populate);
        that._query.sort(that._sort);

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

module.exports = LifeQuery;