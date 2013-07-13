var LifeErrors = require('./LifeErrors.js');
var LifeResponse = require('./LifeResponse.js');

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
var LifeQuery = function(model, req, res, next, query) {
    this.model = model;

    this.req = typeof req !== 'undefined' ? req : null;
    this.res = typeof res !== 'undefined' ? res : null;
    this.next = (typeof next !== 'undefined' && next !== null) ?
              next
            : function() {};
    this._query =
              typeof query == 'function' ? query
            : (query !== null && typeof query == 'object') ? model.find(query)
            : model.find();
    this._limit = this.req && this.req.query.limit ? this.req.query.limit
        : this.model.queryDefaults().limit;
    this._offset = this.req && this.req.query.offset ? this.req.query.offset
        : this.model.queryDefaults().offset;

    this._limit = parseInt(this._limit, 10);
    this._offset = parseInt(this._offset, 10);
    this._populate = this.model.queryDefaults().populate;

    return this;
};

/**
 * Execute query, if no callback is provided data is returned to the client
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
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
LifeQuery.prototype.remove = function(cb) {
    var that = this;

    that._query.populate(that._populate);

    that._query.remove(function(err, data) {
        if (err) {
            console.error(err);
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === 'function') {
            return cb(data);
        }

        return new LifeResponse.send(that.req, that.res).single(data);
    });
};

/**
 * Execute query, remove results from database. Returns number of removed
 * documents. If no callback is provided data is returned to the client.
 *
 * @param {Function} [cb=null] Callback function to be executed on success
 * @method
 */
LifeQuery.prototype.value = function(field, value) {
    if (this.req && typeof value === 'undefined' &&
        typeof this.req.query[field] !== 'undefined') {
        return this.req.query[field];
    }

    return value;
};

/**
 * Add an equality filter to the query.
 *
 * @param {string} field Field on which the filter should be placed
 * @param {string} value Searched value
 * @method
 */
LifeQuery.prototype.filterEquals = function (field, value) {
    value = LifeQuery.value(field, value);

    if (typeof value !== 'undefined') {
        this._query.where(field).equals(value);
    }

    return this;
};



['equals', 'in', 'gt', 'lt', 'gte', 'lte',
    'slice', 'ne', 'nin', 'size', 'all'].forEach(function(operation) {
    LifeQuery.prototype[operation] = function(field, value) {
        value = this.value(field, value);

        if (typeof value !== 'undefined') {
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

/**
 * Add an regular expression filter to the query.
 *
 * @param {string} field Field on which the filter should be placed
 * @param {string} regexp Searched value
 * @param {boolean} [enabled=true] Is this filter enabled
 * @method
 */
LifeQuery.prototype.filterRegexp = function (field, regexp, enabled) {
    if (typeof enabled === 'undefined') {
        enabled = true;
    }

    if (enabled) {
        this._query.where(field, regexp);
    }

    return this;
};

/**
 * Change a private property value.
 *
 * @param {string} property Property name.
 * @param {*} val The new value
 * @method
 */
LifeQuery.prototype.changeValue = function(property, val) {
    this['_' + property] = val;
};

/**
 * Find a document by its identifier. If no callback provided returns document
 * as the API response.
 * Expects a single or no result.
 *
 * @param {string} id Searched id.
 * @param {Function} [cb=null] Callback function to be executed on success.
 * @method
 */
LifeQuery.prototype.findById = function(id, cb) {
    this.query(this.model.find({'_id': id}));

    return this.execOne(true, cb);
};

/**
 * Execute a static function from the model. Pass the query as the first
 * argument.
 *
 * @param {string} item Function to be executed.
 * @method
 */
LifeQuery.prototype.modelStatic = function(item) {
    var args = [this];

    for (var i in arguments) {
        if (i != '0') {
            args.push(arguments[i]);
        }
    }

    return this.model[item].apply(this, args);
};

LifeQuery.prototype.inList = function(ids) {
    this.and({_id: {$in: ids}});

    return this;
};


['query', 'limit', 'offset', 'populate'].forEach(function (property) {
    LifeQuery.prototype[property] = function(val) {
        if (typeof val === 'undefined') {
            return this['_' + property];
        }

        this.changeValue(property, val);
        return this;
    };
});

module.exports = LifeQuery;