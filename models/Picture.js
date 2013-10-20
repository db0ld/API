var mongoose = require('mongoose'),
    element = require('./Element.js');

var Picture = new mongoose.Schema({
    _file_path: {type : String, required: true }
});

Picture.plugin(element);

Picture.virtual('url_small').get(function () {
    return this._file_path;
});

Picture.virtual('url_big').get(function () {
    return this._file_path;
});

Picture.methods.jsonAddon = function (context, level, doc, cb) {
    doc.url_small = 'http://' + context.headers('host', 'api.life.tl') + '/' + doc.url_small;
    doc.url_big = 'http://' + context.headers('host', 'api.life.tl') + '/' + doc.url_big;

    return cb(doc);
};

module.exports = mongoose.model('Picture', Picture);