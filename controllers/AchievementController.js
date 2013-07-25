var Achievement = require('mongoose').model('Achievement'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeSecurity = require('../wrappers/LifeSecurity.js'),
    routeBase = 'achievements';


var bindRequestToAchievement = function(req, res, params, achievement, cb, create) {
    if (achievement.name === null || typeof achievement.name !== 'object') {
        achievement.name = {};
    }

    if (achievement.name[req.lang] != params.name) {
        achievement.markModified('name');
    }

    achievement.name[req.lang] = params.name;

    if (typeof params.description == 'string') {
        if (achievement.description === null || typeof achievement.description !== 'object') {
            achievement.description = {};
        }

        achievement.description[req.lang] = params.description;
        achievement.markModified('description');
    }

    if (typeof params.badge !== 'undefined') {
        achievement.badge = params.badge;
    }

    return cb(achievement);
};

module.exports = function(router) {

    (router)


    .Post(routeBase)
        .doc('Create an achievement')
        .input(Achievement.creationValidation)
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            var achievement = new Achievement();

            return bindRequestToAchievement(req, res, params, achievement, function(achievement) {
                return new LifeData(Achievement, req, res, next).save(achievement);
            }, true);
        })


    .Get(routeBase + '/:achievement_id')
        .doc('Get achievement')
        .output(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next).findById(req.params.achievement_id);
        })


    .Put(routeBase + '/:achievement_id')
        .doc('Modify an achievement')
        .input(Achievement.modificationValidation)
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            return new LifeQuery(Achievement, req, res, next).findById(req.params.achievement_id, function(achievement) {
                if (!achievement) {
                    return next(LifeErrors.NotFound);
                }

                return bindRequestToAchievement(req, res, params, achievement, function(achievement) {
                    return new LifeData(Achievement, req, res, next).save(achievement);
                });
            });
        })


    .Delete(routeBase + '/:achievement_id')
        .doc('Delete an achievement')
        .output(Number)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next, {_id: req.params.achievement_id})
                .remove();
        })


    .Get(routeBase)
        .doc('Get achievements')
        .list(Achievement)
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .modelStatic('term', req.query.term)
                .exec();
        })


    .Post(routeBase + '/:achievement_id/children')
        .doc('Add a child achievement to parent')
        .input({achievement_id: {type: Achievement}})
        .output(Achievement)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next, params) {
            return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.achievement_id, function(achievement) {
                if (achievement === null) {
                    return next(LifeErrors.NotFound);
                }

                if (achievement.child_achievements.indexOf(req.params.achievement_id) === -1) {
                    achievement.child_achievements.push(params.achievement_id);

                    return new LifeData(Achievement, req, res, next).save(achievement);
                }

                return next(LifeErrors.NothingHasChanged);
            });
        })


    .Delete(routeBase + '/:achievement_id/children/:child_achievement_id')
        .doc('Remove a child achievement from parent')
        .output(Number)
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.achievement_id, function(achievement) {
                if (achievement === null) {
                    return next(LifeErrors.NotFound);
                }

                var pos = achievement.child_achievements.indexOf(req.params.child_achievement_id);
                if (pos !== -1) {
                    achievement.child_achievements.splice(pos, 1);

                    return new LifeData(Achievement, req, res, next).save(achievement);
                }

                return next(LifeErrors.NothingHasChanged);
            });
        })


    .Get(routeBase + '/:achievement_id/children')
        .doc('Get child achievements')
        .list(Achievement)
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.achievement_id, function(achievement) {
                if (achievement === null) {
                    return next(LifeErrors.NotFound);
                }

                return new LifeQuery(Achievement, req, res, next, {_id: {$in: achievement.child_achievements}}).exec();
            });
        })


    .Get(routeBase + '/:achievement_id/parents')
        .doc('Get parent achievements')
        .list(Achievement)
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next, {child_achievements: req.params.achievement_id}).exec();
        });
};