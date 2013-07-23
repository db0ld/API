var mongoose = require('mongoose'),
    element = require('./Element.js');

var OAuthTokenSchema = new mongoose.Schema({
    token: {type: String, unique: true},
    expiration: { type : Date, required: true },
    user: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { id: false });

OAuthTokenSchema.plugin(element);

OAuthTokenSchema.virtual('id').get(function () {
    return this.token;
});

OAuthTokenSchema.statics.queryDefaults = function() {
    return {
        'populate': 'user',
        'limit': 10,
        'index': 0
    };
};

OAuthTokenSchema.statics.findByToken = function(query, token, activeOnly) {
    activeOnly = (typeof activeOnly !== 'undefined') ? activeOnly : true;

    var conditions = [{'token': token}];

    if (activeOnly) {
        conditions.push({'expiration': {$gt: new Date()}});
    }

    return query
        .and(conditions);
};

OAuthTokenSchema.statics.findByUserId = function(query, userId, activeOnly) {
    activeOnly = (typeof activeOnly !== 'undefined') ? activeOnly : true;

    var conditions = [];

    conditions.push({'user': userId});

    if (activeOnly) {
        conditions.push({'expiration': {$gt: new Date()}});
    }

    return query.and(conditions);
};

OAuthTokenSchema.statics.creationValidation = {
    'login': {type: String, required: true},
    'password': {type: String, required: true}
};

var OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

module.exports = OAuthToken;