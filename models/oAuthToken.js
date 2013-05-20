var mongoose = require('mongoose');
var LifeQuery = require('../wrappers/LifeQuery.js');

var OAuthTokenSchema = new mongoose.Schema({
    token: {type: String, unique: true},
    creation : { type : Date, 'default' : Date.now },
    expiration: { type : Date, required: true },
    user: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

OAuthTokenSchema.statics.queryDefaults = function() {
    return {
        'populate': 'user',
        'limit': 10,
        'offset': 0
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

var OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);

module.exports = OAuthToken;