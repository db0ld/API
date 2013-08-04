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
                return cb.call(that, data, count);
            }

            return new LifeResponse(that.req, that.res)
                .list(data, count, null, that);
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
            return cb.call(that, data[0]);
        }

        return new LifeResponse(that.req, that.res).single(data[0]);
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
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === 'function') {
            return cb.call(that, data);
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
            return cb.call(that, item);
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
            return cb.call(that, item);
        }

        return new LifeResponse(that.req, that.res).single(item);
    });
};

/**
 * Get the value from request if missing from filter calls
 *
 * @param {String} field Field name
 * @param {*} value
 * @return String
 * @method
 */
LifeQuery.prototype.value = function (field, value) {
    if (this.req && value === undefined &&
            this.req.query[field] !== undefined) {
        return this.req.query[field];
    }

    return value;
};

/**
 * Add an equals clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.equals = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).equals(value);
    }

    return this;
};

/**
 * Add an in clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype['in'] = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field)['in'](value);
    }

    return this;
};

/**
 * Add a greater than clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.gt = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).gt(value);
    }

    return this;
};

/**
 * Add a lesser than clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.lt = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).lt(value);
    }

    return this;
};

/**
 * Add a greater or equals clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.gte = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).gte(value);
    }

    return this;
};

/**
 * Add a lesser or equals clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.lte = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).lte(value);
    }

    return this;
};

/**
 * Add an slice clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.slice = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).slice(value);
    }

    return this;
};

/**
 * Add a not equals clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.ne = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).ne(value);
    }

    return this;
};

/**
 * Add a not in clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.nin = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).nin(value);
    }

    return this;
};

/**
 * Add a slice clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.size = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).size(value);
    }

    return this;
};

/**
 * Add an all clause to query.
 *
 * @param {string} field Field on which the clause will be added.
 * @param {*} [value] The clause value
 * @method
 */
LifeQuery.prototype.all = function (field, value) {
    value = this.value(field, value);

    if (value !== undefined) {
        this._query.where(field).all(value);
    }

    return this;
};

/**
 * Add an and clause to query.
 *
 * @param {*} value The clause value
 * @method
 */
LifeQuery.prototype.and = function (value) {
    this._query.and(value);

    return this;
};

/**
 * Add an or clause to query.
 *
 * @param {*} value The clause value
 * @method
 */
LifeQuery.prototype.or = function (value) {
    this._query.or(value);

    return this;
};

/**
 * Add a not or clause to query.
 *
 * @param {*} value The clause value
 * @method
 */
LifeQuery.prototype.nor = function (value) {
    this._query.nor(value);

    return this;
};

/**
 * Add a sort clause to query.
 *
 * @param {*} value The clause value
 * @method
 */
LifeQuery.prototype.sort = function (value) {
    this._query.sort(value);

    return this;
};

/**
 * Get or set current query value for current instance
 *
 * @param {*} val New value
 */
LifeQuery.prototype.query = function (val) {
    if (val === undefined) {
        return this._query;
    }

    this._query = val;
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
 * Get or set current sort value for current query
 *
 * @param {*} val New value
 */
LifeQuery.prototype.sort = function (val) {
    if (val === undefined) {
        return this._sort;
    }

    this._sort = val;
    return this;
};

module.exports = LifeQuery;