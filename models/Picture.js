var mongoose = require('mongoose');
var media = require('./Media.js');

var PictureSchema = new mongoose.Schema({});
PictureSchema.plugin(media);

PictureSchema.virtual('url_small').get(function () {
    return this._filepath;
});

PictureSchema.virtual('url_big').get(function () {
    return this._filepath;
});

PictureSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'index': 0
    };
};

PictureSchema.methods.jsonAddon = function(req, res, level, doc, cb) {
    doc.url = 'http://' + req.headers.host + '/' + doc.url;
    doc.url_small = 'http://' + req.headers.host + '/' + doc.url_small;
    doc.url_big = 'http://' + req.headers.host + '/' + doc.url_big;

    return cb(doc);
};

var Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;