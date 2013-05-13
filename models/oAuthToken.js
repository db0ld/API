var mongoose = require('mongoose');
var LifeQuery = require('../wrappers/LifeQuery.js');

var OAuthTokenSchema = new mongoose.Schema({
    token: {type: String, required: true, unique: true},
    creation : { type : Date, 'default' : Date.now },
    expiration: { type : Date, required: true }
});

OAuthTokenSchema.statics.findByToken = function(token, req, res, next) {
    return new LifeQuery(this.find(), req, res, next)
      .filterEquals('token', token);
};

var OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

module.exports = OAuthToken;