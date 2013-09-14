var FileConstraint = require('./FileConstraint.js'),
    LifeQuery = require('../LifeQuery.js'),
    Errors = require('./Errors.js'),
    Picture = require('mongoose').model('Picture');

/**
 * ImageConstraint class for constraints
 *
 * @class ImageConstraint
 * @constructor
 */
var ImageConstraint = function (key, required) {
    FileConstraint.call(this, key, required);
};

ImageConstraint.prototype = new FileConstraint();
ImageConstraint.prototype.constructor = FileConstraint;

ImageConstraint.prototype.addon = function () {
    return 'An ImageConstraint file';
};

ImageConstraint.prototype.sanitize = function (validator, cb) {
    var that = this;

    return FileConstraint.prototype.sanitize.call(this, validator, function () {
        var pic = new Picture();
        pic._filepath = validator.output[that.key].path.replace('public/', '');

        return new LifeQuery(Picture, validator.req, null, validator.next).save(pic, function (item) {
            validator.output[that.key] = item;
            return cb(item);
        });
    });
};

module.exports = ImageConstraint;