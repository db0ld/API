var mongoose = require('mongoose');
var element = require('./Element.js');
var Message = require('mongoose').model('Message');
var LifeResponse = require('../wrappers/LifeResponse.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

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

ConversationSchema.methods.jsonAddon = function(req, res, level, doc, cb) {
    doc.referenced_users = doc.referenced_users.items;

    var messagesQuery = new LifeQuery(Message, req, res);
    return messagesQuery.modelStatic('findByConversation', this)
        .exec(function (messages, size) {

            return new LifeResponse(req, res)
                .paginate(messages, [], size, messagesQuery, function(mess) {
                    doc.messages = mess;
                    return cb(doc);
                });

    });
};

ConversationSchema.statics.findByUser = function(query, user) {
    var user_ids = [];

    users.forEach(function(user) {
        if (user !== null && typeof user === 'object') {
            user_ids.push(user._id);
        } else {
            user_ids.push(user);
        }
    });

    return query.in('referenced_users', users);
};

ConversationSchema.statics.queryDefaults = function() {
    return {
        'populate': 'referenced_users',
        'limit': 10,
        'index': 0
    };
};

var Conversation = mongoose.model('Conversation', ConversationSchema);