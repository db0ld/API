var mongoose = require('mongoose');
var element = require('./Element.js');

var MessageSchema = new mongoose.Schema({
    conversation: {type : mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender_ref: { type: Number, required: true },
    content: {type: String, required: true }
});

MessageSchema.plugin(element);

MessageSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'offset': 0
    };
};

MessageSchema.statics.findByConversation = function(query, conversation) {
    return query.and({
        conversation: conversation
    });
};

MessageSchema.statics.findByConversationAndId = function(query, conversation, id) {
    return query.and({
        conversation: conversation,
        _id: id
    });
};

var Message = mongoose.model('Message', MessageSchema);