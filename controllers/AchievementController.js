var Achievement = require('mongoose').model('Achievement');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeSecurity = require('../wrappers/LifeSecurity.js');

var routeBase = 'achievements';

var bindRequestToAchievement = function(req, res, next, achievement, cb, create) {
    new LifeData(Achievement, req, res, next).whitelist(
            create ? Achievement.creationValidation
                : Achievement.modificationValidation, null, function(params) {
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
    });
};

module.exports = function(router) {

    (router)


    .Post(routeBase)
        .doc('Create an achievement')
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            var achievement = new Achievement();

            return bindRequestToAchievement(req, res, next, achievement, function(achievement) {
                return new LifeData(Achievement, req, res, next).save(achievement);
            }, true);
        })


    .Get(routeBase + '/:achievement_id')
        .doc('Get achievement')
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next).findById(req.params.achievement_id);
        })


    .Put(routeBase + '/:id')
        .doc('Modify an achievement')
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next).findById(req.params.id, function(achievement) {
                if (!achievement) {
                    return next(LifeErrors.NotFound);
                }

                return bindRequestToAchievement(req, res, next, achievement, function(achievement) {
                    return new LifeData(Achievement, req, res, next).save(achievement);
                });
            });
        })


    .Delete(routeBase + '/:id')
        .doc('Delete an achievement')
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next, {_id: req.params.id})
                .remove();
        })


    .Get(routeBase)
        .doc('Get achievements')
        .list()
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next)
                .modelStatic('term', req.query.term)
                .exec();
        })


    .Post(routeBase + '/:id/children')
        .doc('Add a child achievement to parent')
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            new LifeData(Achievement, req, res, next).whitelist({achievement_id: {type: String}}, null, function(params) {
                return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.id, function(achievement) {
                    if (achievement === null) {
                        return next(LifeErrors.NotFound);
                    }

                    if (achievement.child_achievements.indexOf(req.params.id) === -1) {
                        achievement.child_achievements.push(params.achievement_id);

                        return new LifeData(Achievement, req, res, next).save(achievement);
                    }

                    return next(LifeErrors.NothingHasChanged);
                });
            });
        })


    .Delete(routeBase + '/:id/children/:child_id')
        .doc('Remove a child achievement from parent')
        .auth([LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT])
        .add(function (req, res, next) {
            return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.id, function(achievement) {
                if (achievement === null) {
                    return next(LifeErrors.NotFound);
                }

                var pos = achievement.child_achievements.indexOf(req.params.child_id);
                if (pos !== -1) {
                    achievement.child_achievements.splice(pos, 1);

                    return new LifeData(Achievement, req, res, next).save(achievement);
                }

                return next(LifeErrors.NothingHasChanged);
            });
        })


    .Get(routeBase + '/:id/children')
        .doc('Get child achievements')
        .list()
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.id, function(achievement) {
                if (achievement === null) {
                    return next(LifeErrors.NotFound);
                }

                return new LifeQuery(Achievement, req, res, next, {_id: {$in: achievement.child_achievements}}).exec();
            });
        })


    .Get(routeBase + '/:id/parents')
        .doc('Get parent achievements')
        .list()
        .add(function(req, res, next) {
            return new LifeQuery(Achievement, req, res, next, {child_achievements: req.params.id}).exec();
        });
};