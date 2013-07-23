var mongoose = require('mongoose'),
    Achievement = mongoose.model('Achievement'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    LifeUpload = require('../wrappers/LifeUpload.js'),
    element = require('./Element.js'),
    LifeData = require('../wrappers/LifeData.js'),
    regexps = LifeData.regexps;

var AchievementStatusSchema = new mongoose.Schema({
    message: {type: String, required: true, ref: 'User'},
    state: {type: String, required: true, ref: 'User', match: regexps.achievementState},
    owner: {type: ObjectId, required: true, ref: 'User'},
    achievement: {type: ObjectId, required: true, ref: 'Achievement'},
    attached_picture: {type: ObjectId, required: false, ref: 'Picture'},
    _approvers: [{type: ObjectId, ref: 'User'}],
    _non_approvers: [{type: ObjectId, ref: 'User'}]
});

AchievementStatusSchema.plugin(element);

AchievementStatusSchema.virtual('score').get(function() {
    return ((this._approvers && this._approvers.length) || 0) -
        ((this._non_approvers && this._non_approvers.length) || 0);
});

AchievementStatusSchema.virtual('approvers_count').get(function() {
    return (this._approvers && this._approvers.length) || 0;
});

AchievementStatusSchema.virtual('non_approvers_count').get(function() {
    return (this._non_approvers && this._non_approvers.length) || 0;
});

AchievementStatusSchema.virtual('state_code').get(function() {
    return 42;
});

AchievementStatusSchema.statics.validation = {};

AchievementStatusSchema.statics.validation.creation = {
    message: {type: String},
    state: {type: regexps.achievementState},
    achievement: {type: Achievement},
    attached_picture: {type: LifeUpload.Avatar, required: false}
};

AchievementStatusSchema.statics.validation.edition = {
    message: {type: String, required: false},
    state: {type: regexps.achievementState, required: false},
    attached_picture: {type: LifeUpload.Avatar, required: false}
};

AchievementStatusSchema.statics.queryDefaults = function() {
    return {
        'populate': 'achievement attached_picture owner',
        'limit': 10,
        'index': 0,
        'sort': '-creation'
    };
};

AchievementStatusSchema.statics.findByUser = function (query, user) {
    return query.and({owner: user});
};

AchievementStatusSchema.statics.findById = function (query, id) {
    return query.and({_id: id});
};

var AchievementStatus = mongoose.model('AchievementStatus', AchievementStatusSchema);

module.exports = AchievementStatus;