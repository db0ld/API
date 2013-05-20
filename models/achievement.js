var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var I18nStringSchema = require('mongoose').model('I18nString').schema;

var AchievementSchema = new mongoose.Schema({
    name: [I18nStringSchema],
    description: [I18nStringSchema],
    achievements: [{type: ObjectId, required: false}]
});

AchievementSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'offset': 0
    };
};

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;