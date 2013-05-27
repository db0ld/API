var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeData = require('../wrappers/LifeData.js');

var AchievementSchema = new mongoose.Schema({
    name: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    parentAchievements: [{type: ObjectId, required: false, ref: 'Achievement'}]
});

AchievementSchema.options.toJSON = {
    getters: true,
    virtuals: true,
    transform: function(doc, ret, options) {
        obj = doc.toObject({
          virtuals: true
        });

        var lang = 'en_US';

        if (typeof doc._req == "object" && doc._req.lang) {
            lang = doc._req.lang;
        }

        if (typeof obj.description == "object") {
            obj.description = LifeData.i18nPicker(lang, obj.description);
        }

        obj.name = LifeData.i18nPicker(lang, obj.name);

        return obj;
    }
};

AchievementSchema.statics.queryDefaults = function() {
    return {
        'populate': 'achievements',
        'limit': 10,
        'offset': 0
    };
};

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;