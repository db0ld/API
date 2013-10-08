var mongoose = require('mongoose'),
    element = require('./Element.js');

var Client = new mongoose.Schema({
    user: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: {type : String, required: true },
    token: {type : String, required: true, index: { unique: true } },
    application: {type : mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    expiration: {type : Date, required: true },
    oauth_provider: {type : String, required: false },
    oauth_token: {type : String, required: false }
});

Client.plugin(element);

Client.statics.queryDefaults.populate = 'user application';

Client.methods.jsonAddon = function (context, level, doc, cb) {
    delete doc.application;
    delete doc.ip;

    doc.id = this.token;

    return cb(doc);
};

Client.statics.queries.tokenAndDate = function (token, date) {
    if (date === undefined) {
        date = new Date();
    }

    var filter = {$and: [
        {'token': token},
        {'expiration': {$gt: date}}
    ]};

    this._query.and(filter);

    return this;
};

Client.statics.queries.token = function (token) {
    var filter = {'token': token};

    this._query.and(filter);

    return this;
};

Client.statics.buildToken = function(context, user) {
    var client = new this();
    var expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    client.expiration = expiration;
    client.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + expiration.getTime();
    client.user = user;
    client.application = context.application;
    client.ip = context.input.ip || context.connection('remoteAddress');

    return client;
}

module.exports = mongoose.model('Client', Client);