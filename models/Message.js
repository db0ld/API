var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;
var element = require('./Element.js');

var MessageSchema = new mongoose.Schema({
    _conversation: {type : ObjectId, ref: 'Conversation', required: true },
    sender_ref: { type: Number, required: true },
    content: {type: String, required: true }
});

MessageSchema.plugin(element);

MessageSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'index': 0
    };
};

MessageSchema.statics.findByConversation = function(query, conversation) {
    return query.and({
        _conversation: conversation
    });
};

MessageSchema.statics.findByConversationAndId = function(query, conversation,
    id) {
    return query.and({
        _conversation: conversation,
        _id: id
    });
};

var Message = mongoose.model('Message', MessageSchema);