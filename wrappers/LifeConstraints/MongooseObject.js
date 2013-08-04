var LifeQuery = require('../LifeQuery.js'),
    LifeData = require('../LifeData.js'),
    Abstract = require('./Abstract.js'),
    Errors = require('./Errors.js');

/**
 * MongooseObject class for constraints
 *
 * @class MongooseObject
 * @constructor
 */
var MongooseObject = function (model, key, required) {
    this.model = model;

    Abstract.call(this, key, required);
};

MongooseObject.prototype = new Abstract();
MongooseObject.prototype.constructor = Abstract;

MongooseObject.prototype.doc = function () {
    return this.model.modelName;
};

MongooseObject.prototype.addon = function () {
    return 'An ObjectId';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
MongooseObject.prototype.validate = function (validator, cb) {
    var that = this;

    if (!LifeData.isObjectId(validator.data[that.key])) {
        validator.errors.push({
            key: that.key,
            value: validator.data[that.key],
            error: Errors.NotFound
        });

        return cb();
    }

    return new LifeQuery(that.model, validator.req, null, function () {
        validator.errors.push({
            key: that.key,
            value: validator.data[that.key],
            error: Errors.NotFound
        });
    })
        .findById(validator.data[that.key])
        .execOne(true, function (data) {
            if (!data) {
                validator.errors.push({
                    key: that.key,
                    value: validator.data[that.key],
                    error: Errors.NotFound
                });
            } else {
                validator.temp['mongooseobj-' + that.key] = data;
            }

            return cb();
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
MongooseObject.prototype.sanitize = function (validator, cb) {
    validator.output[this.key] = validator.temp['mongooseobj-' + this.key];

    return cb();
};

module.exports = MongooseObject;