var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeConfig = require('../wrappers/LifeConfig.js');
var LifeData = require('../wrappers/LifeData.js');
var element = require('./Element.js');

var AchievementSchema = new mongoose.Schema({
    name: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    parentAchievements: [{type: ObjectId, required: false, ref: 'Achievement'}]
});

AchievementSchema.virtual('url').get(function () {
  return LifeConfig.website_url + 'achievements/' + this._id;
});

AchievementSchema.plugin(element);

AchievementSchema.options.toJSON = {
    getters: true,
    virtuals: true,
    transform: function(doc, ret, options) {
        obj = doc.toObject({
          virtuals: true
        });

        var lang = 'en_US';

        if (doc._req !== null && typeof doc._req == "object" && doc._req.lang) {
            lang = doc._req.lang;
        }

        if (obj.description !== null && typeof obj.description == "object") {
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

AchievementSchema.statics.creationValidation = {
    'name': {type: String, required: true},
    'description': {type: String, required: false}
};

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;