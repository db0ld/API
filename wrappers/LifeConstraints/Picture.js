var _ = require('lodash'),
    FileConstraint = require('./FileConstraint.js'),
    LifeQuery = require('../LifeQuery.js'),
    Errors = require('./Errors.js');

/**
 * Image class for constraints
 *
 * @class Image
 * @constructor
 */
var Image = function (key, required, options) {
    FileConstraint.call(this, key, required, options);

    this.options = {
        output_picture: false,
        allow_http: true,
        allowed_extensions: ['jpg', 'png', 'jpeg']
    };

    _.merge(this.options, options);
};

Image.prototype = new FileConstraint();
Image.prototype.constructor = FileConstraint;

Image.prototype.addon = function () {
    return 'An Image file, or an Image URL';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
Image.prototype.validate = function (validator, cb) {
    return FileConstraint.prototype.validate.call(this, validator, function (ret) {
        return cb(ret);
    });
};

Image.prototype.sanitize = function (validator, cb) {
    var that = this;
    var Picture = require('mongoose').model('Picture');
    var Media = require('mongoose').model('Media');

    return FileConstraint.prototype.sanitize.call(this, validator, function () {
        var pic = new Picture();
        pic._file_path = validator.output[that.key].path
            .replace(/\\/g, '/')
            .replace(/^public\//, '');

        return new LifeQuery(Picture, validator.context).save(pic, function (pic) {
            var media = new Media();
            media.picture = pic;
            media.type = 'picture';

            if (validator.context.user()) {
                media.owner = validator.context.user().id;
            }

            return new LifeQuery(Media, validator.context).save(media, function (media) {
                validator.output[that.key] = that.options.output_picture
                    ? pic.id
                    : media.id;

                return cb();
            });
        });
    });
};

module.exports = Image;