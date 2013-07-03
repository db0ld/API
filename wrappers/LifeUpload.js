var fs = require('fs');
var LifeConfig = require('./LifeConfig.js');

var LifeUpload = function(options) {
    this.extension = null;
    this.type = null;
    this.maxSize = -1;

    var criterias = ['extension', 'type', 'maxSize'];

    for (var i in criterias) {
        if (typeof options[i] != 'undefined') {
            this[i] = options[i];
        }
    }
};

LifeUpload.prototype.allowed = function(file, cb) {
    return cb(true);
};

LifeUpload.prototype.object = function(req, res, next, parameter, path, cb) {
    return cb(true);
};

LifeUpload.prototype.upload = function(req, res, next, parameter, path, cb) {
    var that = this;
    var public_path = LifeConfig.public_uploaded_path + '/' + path;
    path = LifeConfig.dir_uploaded + '/' + path;

    return that.allowed(req.files[parameter], function(allowed) {
        if (!allowed) {
            return fs.unlink(req.files[parameter].path, function(err) {
                if (err) {
                    console.error('Error while unlinking ' +
                        req.files[parameter].path);
                }

                return cb(null);
            });
        }

        return fs.rename(req.files[parameter].path, path, function(err) {
            if (err) {
                return next(LifeErrors.UploadError);
            }

            return that.object(req, res, next, parameter, public_path, cb);
        });
    });
};

/*
 *
 * Image upload functions
 *
 */

LifeUpload.ImageCriteria = function(x, y, size, animated) {
    var extensions = ['png', 'jpg', 'jpeg'];

    if (animated === true) {
        extensions.push('gif');
    }

    LifeUpload.call(this, {
        maxSize: size,
        extension: extensions
    });

    this.maxX = x;
    this.maxY = y;
};

LifeUpload.ImageCriteria.prototype = new LifeUpload({});
LifeUpload.ImageCriteria.prototype.constructor = LifeUpload.ImageCriteria;

LifeUpload.prototype.object = function(req, res, next, parameter, path, cb) {
    var Picture = require('mongoose').model('Picture');
    var LifeData = require('./LifeData.js');

    var pic = new Picture();
    pic._filepath = path;

    return new LifeData(Picture, req, res, next).save(pic, function(item) {
        return cb(item);
    });
};

LifeUpload.ImageCriteria.prototype.allowed = function(file, cb) {
    return cb(true);
};

LifeUpload.Avatar = new LifeUpload.ImageCriteria(2048, 2048, 2097152);

module.exports = LifeUpload;
