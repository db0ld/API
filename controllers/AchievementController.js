var Achievement = require('mongoose').model('Achievement'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeSecurity = require('../wrappers/LifeSecurity.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    routeBase = 'achievements';


var bindRequestToAchievement = function (req, res, params, achievement, cb, create) {
    if (achievement.name === null || typeof achievement.name !== 'object') {
        achievement.name = {};
    }

    if (achievement.name[req.lang] !== params.name) {
        achievement.markModified('name');
    }

    achievement.name[req.lang] = params.name;

    if (typeof params.description === 'string') {
        if (achievement.description === null || typeof achievement.description !== 'object') {
            achievement.description = {};
        }

        achievement.description[req.lang] = params.description;
        achievement.markModified('description');
    }

    if (params.badge !== undefined) {
        achievement.badge = params.badge;
    }

    return cb(achievement);
};

module.exports = function (router) {

    router

        .Post('Create an achievement')
        .route(routeBase)
        .input(Achievement.creationValidation)
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            var achievement = new Achievement();

            return bindRequestToAchievement(req, res, params, achievement, function (achievement) {
                return new LifeQuery(Achievement, req, res, next).save(achievement);
            }, true);
        })


        .Get('Get achievement')
        .route(routeBase + '/:achievement_id')
        .output(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .findById(req.params.achievement_id)
                .execOne();
        })


        .Put('Modify an achievement')
        .route(routeBase + '/:achievement_id')
        .input(Achievement.modificationValidation)
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            return new LifeQuery(Achievement, req, res, next)
                .findById(req.params.achievement_id)
                .execOne(function (achievement) {
                    if (!achievement) {
                        return next(LifeErrors.NotFound);
                    }

                    return bindRequestToAchievement(req, res, params, achievement, function (achievement) {
                        return new LifeQuery(Achievement, req, res, next).save(achievement);
                    });
                });
        })


        .Delete('Delete an achievement')
        .route(routeBase + '/:achievement_id')
        .output(Number)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .findById(req.params.achievement_id)
                .remove();
        })


        .Get('Get achievements')
        .route(routeBase)
        .list(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .term(req.query.term)
                .exec();
        })


        .Post('Add a child achievement to parent')
        .route(routeBase + '/:achievement_id/children')
        .input([
            new LifeConstraints.MongooseObject(Achievement, 'achievement_id', true)
        ])
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            return new LifeQuery(Achievement, req, res, next)
                .populate('')
                .findById(req.params.achievement_id)
                .execOne(function (achievement) {
                    if (achievement === null) {
                        return next(LifeErrors.NotFound);
                    }

                    if (achievement.child_achievements.indexOf(req.params.achievement_id) === -1) {
                        achievement.child_achievements.push(params.achievement_id);

                        return new LifeQuery(Achievement, req, res, next).save(achievement);
                    }

                    return next(LifeErrors.NothingHasChanged);
                });
        })


        .Delete('Remove a child achievement from parent')
        .route(routeBase + '/:achievement_id/children/:child_achievement_id')
        .output(Number)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .populate('')
                .findById(req.params.achievement_id)
                .execOne(function (achievement) {
                    if (achievement === null) {
                        return next(LifeErrors.NotFound);
                    }

                    var pos = achievement.child_achievements.indexOf(req.params.child_achievement_id);
                    if (pos !== -1) {
                        achievement.child_achievements.splice(pos, 1);

                        return new LifeQuery(Achievement, req, res, next).save(achievement);
                    }

                    return next(LifeErrors.NothingHasChanged);
                });
        })


        .Get('Get child achievements')
        .route(routeBase + '/:achievement_id/children')
        .list(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .populate('')
                .findById(req.params.achievement_id)
                .execOne(function (achievement) {
                    if (achievement === null) {
                        return next(LifeErrors.NotFound);
                    }

                    return new LifeQuery(Achievement, req, res, next)
                        .findByIds(achievement.child_achievements)
                        .exec();
                });
        })


        .Get('Get parent achievements')
        .route(routeBase + '/:achievement_id/parents')
        .list(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .parents(req.params.achievement_id)
                .exec();
        });
};