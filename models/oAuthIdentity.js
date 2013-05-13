var mongoose = require('mongoose');

var OAuthIdentitySchema = new mongoose.Schema({
    provider: {type: String, required: true},
    ext_id: {type: String, required: true}
});

var OAuthIdentity = mongoose.model('OAuthIdentity', OAuthIdentitySchema);

module.exports = OAuthIdentity;