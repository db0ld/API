var Achievement = require('mongoose').model('Achievement');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeSecurity = require('../wrappers/LifeSecurity.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function(app) {
    var routeBase = 'achievements';

    var bindRequestToAchievement = function(achievement, req) {
        if (typeof achievement.name !== "object") {
            achievement.name = {};
        }

        achievement.name[req.locale] = req.body.name;

        if (typeof req.body.description == 'string') {
            if (typeof achievement.description !== "object") {
                achievement.description = {};
            }

            achievement.description[req.locale] = req.body.description;
            achievement.markModified('description');
        }

        achievement.markModified('name');

        return achievement;
    };

    // add a single achievement
    app.post(routeBase, function (req, res, next) {
        var achievement = new Achievement();

        return new LifeData(Achievement, req, res, next).save(bindRequestToAchievement(achievement, req));
    }, [LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT]);

    // get a single achievement
    app.get(routeBase + "/:id", function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id);
    });

    // update a single achievement
    app.put(routeBase + "/:id", function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id, function(achievement) {
            if (!achievement) {
                return next(LifeErrors.NotFound);
            }

            return new LifeData(Achievement, req, res, next).save(bindRequestToAchievement(achievement, req));
        });
    }, [LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT]);

    app.delete(routeBase + "/:id", function(req, res, next) {
        return new LifeQuery(Achievement, req, res, next, {_id: req.params.id})
            .remove();
    }, [LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT]);

    // get all achievements
    app.get(routeBase, function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).exec();
    });

    // add a child achievement to an achievement
    app.post(routeBase + '/:id/children', function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id, function(achievement) {
            if (achievement === null) {
                return next();
            }

            return new LifeQuery(Achievement, req, res, next).findById(req.body.achievement_id, function(child_achievement) {
                if (child_achievement === null) {
                    return next();
                }

                child_achievement.parentAchievements.push(achievement.id);
                return new LifeData(Achievement, req, res, next).save(child_achievement);
            });
        });
    }, [LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT]);

    // delete a child achievement to an achievement
    app.delete(routeBase + '/:id/children/:child_id', function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).populate('').findById(req.params.child_id, function(child_achievement) {
            if (child_achievement === null) {
                return next();
            }

            var parent_pos = child_achievement.parentAchievements.indexOf(req.params.id);
            if (parent_pos !== -1) {
                child_achievement.parentAchievements.splice(parent_pos, 1);
                return new LifeData(Achievement, req, res, next).save(child_achievement);
            } else {
                next();
            }
        });
    }, [LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT]);

    // find achievement children
    app.get(routeBase + '/:id/children', function(req, res, next) {
        return new LifeQuery(Achievement, req, res, next, {parentAchievements: req.params.id}).exec();
    });

    // find achievement parents
    app.get(routeBase + '/:id/parents', function(req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id, function(achievement) {
            if (achievement === null) {
                return next();
            }

            return new LifeQuery(Achievement, req, res, next, {_id: {$in: achievement.parentAchievements}}).exec();
        });
    });
};