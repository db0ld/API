var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    element = require('./Element.js');

var MessageSchema = new mongoose.Schema({
    _conversation: {type : ObjectId, ref: 'Conversation', required: true },
    sender_ref: { type: Number, required: true },
    content: {type: String, required: true }
});

MessageSchema.plugin(element);

MessageSchema.statics.queryDefaults = function () {
    return {
        'populate': '',
        'limit': 10,
        'index': 0
    };
};

MessageSchema.statics.queries.findByConversation = function (conversation) {
    return this.and({
        _conversation: conversation
    });
};

var Message = mongoose.model('Message', MessageSchema);