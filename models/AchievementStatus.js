var mongoose = require('mongoose'),
    element = require('./Element.js'),
    approvable = require('./Approvable.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeData = require('../wrappers/LifeData.js'),
    AchievementStatusStatus = LifeConstraints.AchievementStatusStatus,
    ObjectId = mongoose.Schema.Types.ObjectId;

var AchievementStatus = new mongoose.Schema({
    owner: {type: ObjectId, required: true, ref: 'User'},
    achievement: {type: ObjectId, required: true, ref: 'Achievement'},
    status: {type: String, match: new AchievementStatusStatus().regexp(),
            required: true},
    message: {type: String, required: false},
    //medias: [{type: ObjectId, required: false, ref: 'Picture'}],
});

AchievementStatus.plugin(element);
AchievementStatus.plugin(approvable);

AchievementStatus.virtual('url').get(function () {
    return 'http://life.tl/u/' + this.owner.login + '/' . (this.status == 'objective' ? 'bucketlist' : 'board') . '/' + this.id;
});

AchievementStatus.statics.queryDefaults.populate = 'owner achievement';

AchievementStatus.statics.queries.byUserId = function (user_id) {
    this._query.and({owner: user_id});

    return this;
};

module.exports = mongoose.model('AchievementStatus', AchievementStatus);