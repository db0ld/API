var mongoose = require('mongoose'),
    element = require('./Element.js'),
    LifeData = require('../wrappers/LifeData.js'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var Achievement = new mongoose.Schema({
    name: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    //badge: {type: ObjectId, required: false, ref: 'Picture'},
    category: {type: Boolean, required: true, default: false},
    _parents: [{type: ObjectId, required: false, ref: 'Achievement'}],
    discoverable: {type: Boolean, required: true, default: true},
    secret: {type: Boolean, required: true, default: false},
});

Achievement.plugin(element);

Achievement.methods.jsonAddon = function (context, level, doc, cb) {
    // TODO achievement_status
    // TODO url

    if (doc.description !== null && typeof doc.description === 'object') {
        doc.description = LifeData.i18nPicker(doc.description, context.locale);
    }

    doc.name = LifeData.i18nPicker(doc.name, context.locale);

    return cb(doc);
};

Achievement.statics.queries.root = function () {
    this._query.and({_parents: {$size: 0}});

    return this;
};

module.exports = mongoose.model('Achievement', Achievement);