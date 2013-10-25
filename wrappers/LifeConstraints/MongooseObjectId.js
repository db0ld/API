var Abstract = require('./Abstract.js'),
    MongooseObjectIds = require('./MongooseObjectIds.js'),
    Errors = require('./Errors.js');

/**
 * MongooseObjectId class for constraints
 *
 * @class MongooseObjectId
 * @constructor
 */
var MongooseObjectId = function (model, key, required) {
    this.MongooseObjectId = MongooseObjectId;

    MongooseObjectIds.call(this, model, key, required);
};

MongooseObjectId.prototype = new MongooseObjectIds();
MongooseObjectId.prototype.constructor = MongooseObjectIds;

MongooseObjectIds.prototype.doc = function () {
    return 'ObjectId';
};

MongooseObjectIds.prototype.addon = function () {
    return null;
};

MongooseObjectId.prototype.validate = function (validator, cb) {
    var that = this;

    if (validator.data[that.key].split(',') > 2) {
        validator.errors.push(new Errors.TooLong(this.key, validator.data[this.key]));
        return Abstract.prototype.validate.call(this, validator, cb);
    }

    return MongooseObjectIds.prototype.validate.call(this, validator, cb);
};

MongooseObjectId.prototype.sanitize = function (validator, cb) {
    var that = this;

    return MongooseObjectIds.prototype.sanitize.call(this, validator, function () {
        validator.output[that.key] = validator.output[that.key][0];

        return cb();
    });
};


module.exports = MongooseObjectId;