var User = require('mongoose').model('User'),
    AchievementStatus = require('mongoose').model('AchievementStatus'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeResponse = require('../wrappers/LifeResponse.js'),
    Activity = require('mongoose').model('Activity'),
    routeBase = 'activities';

var wrapAchievementStatus = function (achievementStatus) {
    return new Activity({
        id: achievementStatus.id,
        creation: achievementStatus.creation,
        modification: achievementStatus.modification,
        achievement_status: achievementStatus,
        activity: 'achievement_status',
        activity_type: 42
    });
};

module.exports = function (router) {


    router


        .Get('Get an activity')
        .route(routeBase + '/:activity_id')
        .output(Activity)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findById(req.params.activity_id)
                .exec(function (achievementStatus) {
                    if (!achievementStatus) {
                        return next(LifeErrors.NotFound);
                    }
                    return new LifeResponse(req, res).single(wrapAchievementStatus(achievementStatus));
                });
        })


        .Get('Get activity for an user')
        .route('users/:user_id/' + routeBase)
        .list(Activity)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    var query = new LifeQuery(AchievementStatus, req, res, next)
                        .findByUser(user.id);

                    return query.exec(function (achievementStatuses, count) {
                        return new LifeResponse(req, res)
                            .list(achievementStatuses.map(wrapAchievementStatus), count, null, query);
                    });
                });
        })


        .Get('Get all users activity feed')
        .route('feed')
        .list(Activity)
        .add(function (req, res, next) {
            var query = new LifeQuery(AchievementStatus, req, res, next);

            return query.exec(function (achievementStatuses, count) {
                return new LifeResponse(req, res)
                    .list(achievementStatuses.map(wrapAchievementStatus), count, null, query);
            });
        });
};