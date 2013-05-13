var mongoose = require('mongoose');
var LifeQuery = require('../wrappers/LifeQuery.js');

var OAuthTokenSchema = new mongoose.Schema({
    token: {type: String, unique: true},
    creation : { type : Date, 'default' : Date.now },
    expiration: { type : Date, required: true }
});

OAuthTokenSchema.statics.findOauthToken = function(user, token, req, res, next) {
};

var OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

module.exports = OAuthToken;