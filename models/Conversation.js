var mongoose = require('mongoose'),
    element = require('./Element.js'),
    Message = require('mongoose').model('Message'),
    LifeResponse = require('../wrappers/LifeResponse.js'),
    LifeQuery = require('../wrappers/LifeQuery.js');

var ConversationSchema = new mongoose.Schema({
    referenced_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

ConversationSchema.plugin(element);

ConversationSchema.virtual('messages').get(function () {
    return [];
});

ConversationSchema.methods.jsonAddon = function (req, res, level, doc, cb) {
    doc.referenced_users = doc.referenced_users.items;

    var messagesQuery = new LifeQuery(Message, req, res);
    return messagesQuery.findByConversation(this)
        .exec(function (messages, size) {

            return new LifeResponse(req, res)
                .paginate(messages, [], size, messagesQuery, function (mess) {
                    doc.messages = mess;
                    return cb(doc);
                });

        });
};

ConversationSchema.statics.queryDefaults = function () {
    return {
        'populate': 'referenced_users',
        'limit': 10,
        'index': 0
    };
};

ConversationSchema.statics.queries.findByUsers = function (users) {
    var user_ids = [];

    users.forEach(function (user) {
        if (user !== null && typeof user === 'object') {
            user_ids.push(user._id);
        } else {
            user_ids.push(user);
        }
    });

    return this.size('referenced_users', users.size)
        .all('referenced_users', users);
};

ConversationSchema.statics.queries.findByUser = function (user) {
    var user_ids = [];

    if (user !== null && typeof user === 'object') {
        user_ids.push(user._id);
    } else {
        user_ids.push(user);
    }

    return this['in']('referenced_users', user);
};

var Conversation = mongoose.model('Conversation', ConversationSchema);