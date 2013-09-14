var Abstract = require('./Abstract.js'),
    LifeQuery = require('../LifeQuery.js'),
    Errors = require('./Errors.js');

/**
 * MongooseUnique. class for constraints
 *
 * @class MongooseUnique.
 * @constructor
 */
var MongooseUnique = function (model, field, key, required) {
    this.model = model;
    this.field = field;
    Abstract.call(this, key, required);
};

MongooseUnique.prototype = new Abstract();
MongooseUnique.prototype.constructor = Abstract;

MongooseUnique.prototype.doc = function () {
    return 'MongooseUnique';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
MongooseUnique.prototype.validate = function (validator, cb) {
    var that = this;

    var query = {};
    query[that.field] = validator.data[that.key];

    new LifeQuery(that.model, validator.context, query)
        .execOne(true, function (item) {
            if (item) {
                validator.errors.push(new Errors.Duplicate(that.key, validator.data[that.key]));
            }

            return Abstract.prototype.validate.call(that, validator, cb);
        });
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
MongooseUnique.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = validator.data[this.key];

    return cb();
};

module.exports = MongooseUnique;