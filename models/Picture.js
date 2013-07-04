var mongoose = require('mongoose');
var media = require('./Media.js');

var PictureSchema = new mongoose.Schema({});
PictureSchema.plugin(media);

PictureSchema.virtual('url_small').get(function () {
    if (this._req && this._req.headers && this._req.headers.host) {
        return 'http://' + this._req.headers.host + '/' + this._filepath;
    }

    return this._filepath;
});

PictureSchema.virtual('url_big').get(function () {
    if (this._req && this._req.headers && this._req.headers.host) {
        return 'http://' + this._req.headers.host + '/' + this._filepath;
    }

    return this._filepath;
});

PictureSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'offset': 0
    };
};

var Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;