var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    LifeConfig = require('../wrappers/LifeConfig.js'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    Picture = mongoose.model('Picture'),
    element = require('./Element.js');

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



AchievementSchema.methods.jsonAddon = function (req, res, level, doc, cb) {
    if (doc.description !== null && typeof doc.description === 'object') {
        doc.description = LifeData.i18nPicker(doc.description, req.lang);
    }

    doc.name = LifeData.i18nPicker(doc.name, req.lang);

    return cb(doc);
};

AchievementSchema.statics.queryDefaults = function () {
    return {
        'populate': 'child_achievements badge',
        'limit': 10,
        'index': 0
    };
};

AchievementSchema.statics.queries.term = function (term) {
    var query = this;

    if (term !== undefined && term !== null) {
        term.split(/\s/).forEach(function (term) {
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

AchievementSchema.statics.queries.parents = function (id) {
    var query = this;

    return query.and({child_achievements: id});
};

AchievementSchema.statics.creationValidation = [
    new LifeConstraints.MinLength(1, 'name'),
    new LifeConstraints.String('description', false),
    new LifeConstraints.Image('badge', false)
];

AchievementSchema.statics.modificationValidation = [
    new LifeConstraints.MinLength(1, 'name', false),
    new LifeConstraints.String('description', false),
    new LifeConstraints.Image('badge', false)
];

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;