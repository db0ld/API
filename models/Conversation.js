var mongoose = require('mongoose');
var element = require('./Element.js');

var ConversationSchema = new mongoose.Schema({
    referenced_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

ConversationSchema.plugin(element);

ConversationSchema.statics.findByUsers = function(query, users) {
    var user_ids = [];

    users.forEach(function(user) {
        if (user !== null && typeof user === 'object') {
            user_ids.push(user._id);
        } else {
            user_ids.push(user);
        }
    });

    return query.size('referenced_users', users.size)
        .all('referenced_users', users);
};

ConversationSchema.statics.queryDefaults = function() {
    return {
        'populate': 'referenced_users',
        'limit': 10,
        'offset': 0
    };
};

var Conversation = mongoose.model('Conversation', ConversationSchema);