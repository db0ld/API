var mongoose = require('mongoose'),
    Achievement = mongoose.model('Achievement'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    element = require('./Element.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js');

var AchievementStatusSchema = new mongoose.Schema({
    message: {type: String, required: true, ref: 'User'},
    state: {type: String, required: true, ref: 'User', match: new LifeConstraints.AchivementStateEnum().regexp()},
    owner: {type: ObjectId, required: true, ref: 'User'},
    achievement: {type: ObjectId, required: true, ref: 'Achievement'},
    attached_picture: {type: ObjectId, required: false, ref: 'Picture'},
    _approvers: [{type: ObjectId, ref: 'User'}],
    _non_approvers: [{type: ObjectId, ref: 'User'}]
});

AchievementStatusSchema.plugin(element);

AchievementStatusSchema.virtual('score').get(function () {
    return ((this._approvers && this._approvers.length) || 0) -
        ((this._non_approvers && this._non_approvers.length) || 0);
});

AchievementStatusSchema.virtual('approvers_count').get(function () {
    return (this._approvers && this._approvers.length) || 0;
});

AchievementStatusSchema.virtual('non_approvers_count').get(function () {
    return (this._non_approvers && this._non_approvers.length) || 0;
});

AchievementStatusSchema.virtual('state_code').get(function () {
    return 42;
});

AchievementStatusSchema.statics.queryDefaults = function () {
    return {
        'populate': 'achievement attached_picture owner',
        'limit': 10,
        'index': 0,
        'sort': '-creation'
    };
};

AchievementStatusSchema.statics.queries.findByUser = function (user) {
    return this.and({owner: user});
};

AchievementStatusSchema.statics.queries.findById = function (id) {
    return this.and({_id: id});
};

AchievementStatusSchema.statics.validation = {};

AchievementStatusSchema.statics.validation.creation = [
    new LifeConstraints.MinLength(1, 'message'),
    new LifeConstraints.AchivementStateEnum('state'),
    new LifeConstraints.MongooseObject(Achievement, 'achievement'),
    new LifeConstraints.Image('attached_picture', false)
];

AchievementStatusSchema.statics.validation.edition = [
    new LifeConstraints.MinLength(1, 'message', false),
    new LifeConstraints.AchivementStateEnum('state', false),
    new LifeConstraints.Image('attached_picture', false)
];

var AchievementStatus = mongoose.model('AchievementStatus', AchievementStatusSchema);

module.exports = AchievementStatus;