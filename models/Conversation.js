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

ConversationSchema.virtual('messages').get(function() {
    return [];
});

ConversationSchema.statics.findByUser = function(query, user) {
    var user_ids = [];

    users.forEach(function(user) {
        if (user !== null && typeof user === 'object') {
            user_ids.push(user._id);
        } else {
            user_ids.push(user);
        }
    });

    return query
        .in('referenced_users', users);
};

ConversationSchema.options.toJSON = {
    getters: true,
    virtuals: true,
    transform: function(doc, ret, options) {
        obj = doc.toObject({
          virtuals: true
        });

        obj['-referenced_users'] = true;

        return obj;
    }
};

ConversationSchema.statics.queryDefaults = function() {
    return {
        'populate': 'referenced_users',
        'limit': 10,
        'offset': 0
    };
};

var Conversation = mongoose.model('Conversation', ConversationSchema);