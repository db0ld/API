var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;
var element = require('./Element.js');

var ActivitySchema = new mongoose.Schema({
    achievement_status: { type: mongoose.Schema.Types.ObjectId, ref: 'AchievementStatus' },
    activity: {type: String, required: false},
    activity_type: {type: Number, required: false}
});

ActivitySchema.plugin(element);

ActivitySchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'index': 0
    };
};

ActivitySchema.methods.jsonAddon = function(req, res, level, doc, cb) {
    if (doc.achievement_status && doc.achievement_status.id) {
        doc.id = doc.achievement_status.id;
    }

    cb(doc);
};

var Activity = mongoose.model('Activity', ActivitySchema);