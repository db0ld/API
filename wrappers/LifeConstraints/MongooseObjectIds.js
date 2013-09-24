var Abstract = require('./Abstract.js'),
    LifeQuery = require('../LifeQuery.js'),
    LifeData = require('../LifeData.js'),
    Errors = require('./Errors.js');

/**
 * MongooseObjectIds. class for constraints
 *
 * @class MongooseObjectIds.
 * @constructor
 */
var MongooseObjectIds = function (model, key, required) {
    this.model = model;
    Abstract.call(this, key, required);
};

MongooseObjectIds.prototype = new Abstract();
MongooseObjectIds.prototype.constructor = Abstract;

MongooseObjectIds.prototype.doc = function () {
    return 'MongooseObjectIds';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
MongooseObjectIds.prototype.validate = function (validator, cb) {
    var that = this;
    var ids = validator.data[that.key].split(',');

    for (var i = ids.length - 1; i >= 0; i--) {
        if (!LifeData.isObjectId(ids[i])) {
            validator.errors.push(new Errors.NotFound(that.key, validator.data[that.key]));
            return Abstract.prototype.validate.call(that, validator, cb);
        }
    }

    var query = {_id : {$in: ids}};

    return new LifeQuery(that.model, validator.context, query)
        .limit(null)
        .exec(function (items, count) {
            if (count != ids.length) {
                validator.errors.push(new Errors.NotFound(that.key, validator.data[that.key]));
            }

            validator.temp['mongooseobj-' + that.key] = items;

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
MongooseObjectIds.prototype.sanitize = function (validator, cb) {
    var that = this;

    if (validator.temp['mongooseobj-' + this.key] === undefined) {
        this.validate(validator, function () {
            validator.output[that.key] = validator.temp['mongooseobj-' + that.key];
        });
    }

    validator.output[this.key] = validator.temp['mongooseobj-' + this.key];

    return cb();
};

module.exports = MongooseObjectIds;