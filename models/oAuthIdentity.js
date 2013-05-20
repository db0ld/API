var mongoose = require('mongoose');

var OAuthIdentitySchema = new mongoose.Schema({
    provider: {type: String, required: true},
    ext_id: {type: String, required: true}
});

OAuthIdentitySchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'offset': 0
    };
};

var OAuthIdentity = mongoose.model('OAuthIdentity', OAuthIdentitySchema);

module.exports = OAuthIdentity;