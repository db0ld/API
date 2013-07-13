var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeConfig = require('../wrappers/LifeConfig.js');
var LifeData = require('../wrappers/LifeData.js');
var Picture = mongoose.model('Picture');
var LifeUpload = require('../wrappers/LifeUpload.js');
var element = require('./Element.js');

var AchievementSchema = new mongoose.Schema({
    name: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    badge: {type: ObjectId, required: false, ref: 'Picture'},
    child_achievements: [{type: ObjectId, required: false, ref: 'Achievement'}]
});

AchievementSchema.virtual('url').get(function () {
  return LifeConfig.website_url + 'achievements/' + this._id;
});

AchievementSchema.plugin(element);

AchievementSchema.methods.jsonAddon = function(req, res, level, doc, cb) {
    if (doc.description !== null && typeof doc.description == 'object') {
        doc.description = LifeData.i18nPicker(doc.description, req.lang);
    }

    doc.name = LifeData.i18nPicker(doc.name, req.lang);

    return cb(doc);
};

AchievementSchema.statics.queryDefaults = function() {
    return {
        'populate': 'child_achievements badge',
        'limit': 10,
        'offset': 0
    };
};

AchievementSchema.statics.term = function(query, term) {
    if (typeof term != "undefined" && term !== null) {
        term.split(/\s/).forEach(function(term) {
            var locale = 'fr-FR';

            // HAS TO BE CHANGED, SEVERE PERFORMANCE ISSUES WILL COME

            query.and({$where:
                "(" +
                "(this.name && this.name['" + locale + "'] && this.name['" + locale + "'] || '') + " +
                "(this.description && this.description['" + locale + "'] && this.description['" + locale + "'] || '')" +
                ")" +
                ".toLowerCase().indexOf('" + term.toLowerCase() + "') !== -1;"
            });
        });
    }

    return query;
};

AchievementSchema.statics.creationValidation = {
    'name': {type: String, required: true},
    'description': {type: String, required: false},
    'badge': { type: LifeUpload.Avatar, required: false }
};

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;