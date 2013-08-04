var FileConstraint = require('./FileConstraint.js'),
    LifeQuery = require('../LifeQuery.js'),
    Errors = require('./Errors.js'),
    Picture = require('mongoose').model('Picture');

/**
 * Image class for constraints
 *
 * @class Image
 * @constructor
 */
var Image = function (key, required) {
    FileConstraint.call(this, key, required);
};

Image.prototype = new FileConstraint();
Image.prototype.constructor = FileConstraint;

Image.prototype.addon = function () {
    return 'An Image file';
};

Image.prototype.sanitize = function (validator, cb) {
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

module.exports = Image;