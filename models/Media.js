var LifeData = require('../wrappers/LifeData.js');
var element = require('./Element.js');

module.exports = function (schema, options) {
    schema.plugin(element);

    schema.add({
        _filepath: {type: String, unique: true},
        title: {type: String, 'default': 'untitled'}
    });

    schema.virtual('url').get(function () {
        if (!this._filepath.match(/\:\/\//) &&
            this._req && this._req.headers && this._req.headers.host) {
            return 'http://' + this._req.headers.host + '/' + this._filepath;
        }

        return this._filepath;
    });
};
