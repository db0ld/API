var mongoose = require('mongoose'),
    element = require('./Element.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeResponse = require('../wrappers/LifeResponse.js'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var I18nString = {
    string: {type: String, required: true},
    locale: {type: String, required: true}
};

var Achievement = new mongoose.Schema({
    name: [I18nString],
    description: [I18nString],
    badge: {type: ObjectId, required: false, ref: 'Picture'},
    category: {type: Boolean, required: true, default: false},
    _parents: [{type: ObjectId, required: false, ref: 'Achievement'}],
    discoverable: {type: Boolean, required: true, default: true},
    secret: {type: Boolean, required: true, default: false},
    color: {type: String, required: true, default: '#008000'}
});

Achievement.plugin(element);

Achievement.virtual('url').get(function () {
    return 'http://life.tl/achievements/' + this.id;
});

// doc.achievement_status
Achievement.methods.abstractJson.push(function (context, level, doc, cb) {
    if (!context.user()) {
        return cb(doc);
    }

    var AchievementStatus = mongoose.model('AchievementStatus');

    return new LifeQuery(AchievementStatus, context)
        .byUserId(context.user().id)
        .byAchievement(this.id)
        .execOne(true, function (achievement_status) {
            if (achievement_status) {
                return achievement_status.fullJson(context, level, function (subdoc) {
                    doc.achievement_status = subdoc;

                    return cb(doc);
                });
            }

            return cb(doc);
        });
});


Achievement.methods.jsonAddon = function (context, level, doc, cb) {
    doc.description = LifeData.i18nPicker(this.description, context.locale);
    doc.name = LifeData.i18nPicker(this.name, context.locale);

    return cb(doc);
};

Achievement.statics.queries.root = function () {
    this._query.and({_parents: {$size: 0}});

    return this;
};

module.exports = mongoose.model('Achievement', Achievement);