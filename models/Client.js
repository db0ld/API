var mongoose = require('mongoose'),
    element = require('./Element.js');

var Client = new mongoose.Schema({
    user: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: {type : String, required: true },
    token: {type : String, required: true, index: { unique: true } },
    application: {type : mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    expiration: {type : String, required: true },
    oauth_provider: {type : String, required: false },
    oauth_token: {type : String, required: false }
});

Client.plugin(element);

Client.statics.queryDefaults.populate = 'user application';

module.exports = mongoose.model('Client', Client);