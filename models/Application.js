var mongoose = require('mongoose'),
    element = require('./Element.js');

var Application = new mongoose.Schema({
    name: {type : String, required: true },
    user_agent: {type : String, required: false },
    secret:  {type : String, required: true }
});

Application.plugin(element);

Application.statics.queries.userAgent = function (ua) {
    this._query.and({
        'user_agent': ua
    });

    return this;
};

Application.methods.jsonAddon = function (context, level, doc, cb) {
    delete doc.secret;

    return cb(doc);
};

module.exports = mongoose.model('Application', Application);