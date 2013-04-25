var mongoose = require('mongoose');

var oAuthTokenSchema = new mongoose.Schema({
	token: {type: String, required: true},
	creation : { type : Date, 'default' : Date.now },
	expiration: { type : Date, required: true }
});

var OAuthToken = mongoose.model('OAuthToken', oAuthTokenSchema);

exports.oAuthTokenSchema = oAuthTokenSchema;
exports.OAuthToken = OAuthToken;