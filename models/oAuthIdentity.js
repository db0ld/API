var mongoose = require('mongoose');

var oAuthIdentitySchema = new mongoose.Schema({
	provider: {type: String, required: true},
	ext_id: {type: String, required: true}
});

var OAuthIdentity = mongoose.model('OAuthIdentity', oAuthIdentitySchema);

exports.oAuthIdentitySchema = oAuthIdentitySchema;
exports.OAuthIdentity = OAuthIdentity;