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

        if (typeof doc._req == "object") {
            if (typeof obj.description == "object") {
                obj.description = LifeData.i18nPicker(doc._req.locale, obj.description);
            }

            obj.name = LifeData.i18nPicker(doc._req.locale, obj.name);
        }

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