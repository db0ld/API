var LifeConfig = require('./LifeConfig.js'),
    LifeQuery = require('./LifeQuery.js');

 /**
 * Response management class
 *
 * @class LifeResponse
 * @param {LifeContext} context Life context
 * @constructor
 */
var LifeResponse = function (context) {
    this.context = context;
};

/**
 * Create a simple Json proof version of given object.
 *
 * @param {*} item Item to be serialized
 * @param {Function} cb Callback function to be executed on success
 * @param {Number} [level=0] Current depth
 * @method
 */
LifeResponse.prototype.json = function (item, cb, level) {
    var doc = {};

    if (typeof level !== 'Number') {
        level = 0;
    }

    if (item !== null && typeof item === 'object' &&
        typeof item.fullJson === 'function') {
        return item.fullJson(this.context, level, cb);
    }

    return cb(item);
};

/**
 * Paginate a list.
 *
 * If no callback is given an HTTP response is sent
 *
 * @param {Array} in_data Unserialized output
 * @param {Array} out_data Serialized output
 * @param {Number} size List size
 * @param {LifeQuery} Query to determine current offset and limit
 * @param {Function} cb Callback function to be executed on success
 * @param {Number} [level=0]
 * @method
 */
LifeResponse.prototype.paginate = function (in_data, out_data, size, query,
    cb, level) {
    var that = this;

    if (typeof level !== 'Number') {
        level = 0;
    }

    in_data = (in_data === undefined) ? [] : in_data;
    out_data = (out_data === undefined) ? [] : out_data;

    if (in_data.length === 0) {
        size = (size === undefined) ? out_data.length : size;

        var resp = {
            server_size: parseInt(size, 10),
            index: query ? query.index() : 0,
            limit: query ? query.limit() :
                    out_data.length,
            items: out_data
        };

        if (typeof cb === 'function') {
            return cb(resp);
        }

        return that.single(resp);
    }

    return that.json(in_data.shift(), function (item) {
        out_data.push(item);

        return that.paginate(in_data, out_data, size, query, cb, level);
    }, level);
};

/**
 * Return a HTTP response for a single item
 *
 * @param {Object} data Data to be returned
 * @method
 */
LifeResponse.prototype.single = function (data) {
    var that = this;

    data = (data === undefined) ? null : data;

    return that.json(data, function (data) {
        data = {
            'error': null,
            'element': data
        };

        return that.send(200, data);
    });
};

/**
 * Return a HTTP response for an error
 *
 * @param {Object} err Error to be returned
 * @method
 */
LifeResponse.prototype.error = function(err) {
    var data = {
        'error': err,
        'element': null
    };

    if (LifeConfig.dev && err !== null && err !== undefined) {
        console.error(err);
    }

    var http_code = 400;
    if (err && err.http) {
        http_code = err.http;
        delete err.http;
    }

    return this.send(http_code, data);
};

/**
 * Return a HTTP response
 *
 * @param {Object} data Whole data object
 * @param {Number} http_code HTTP Status code
 * @method
 */
LifeResponse.prototype.send = function(data, http_code) {
    if (this.context.query('callback')) {
        return that.context.send.jsonp(http_code, data);
    }

    return this.context.send.json(http_code, data);
};

/**
 * Return a HTTP response for a list
 *
 * @param {Object} data Data to be returned
 * @method
 */
LifeResponse.prototype.list = function (data, size, query) {
    var that = this;

    return that.paginate(data, [], size, query);
};

module.exports = LifeResponse;