var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var Achievement = require('mongoose').model('Achievement');
var AchievementStatus = require('mongoose').model('AchievementStatus');
var User = require('mongoose').model('User');

/*
 TODO:
    - isDislikeRoute
    - User.findList()
*/

module.exports = function(app) {
    var isDislikeRoute = function(req) {
        return req.route.path.match(/disapprovers/) !== null;
    };

    var routeBase = 'achievement_statuses';

    app.get('users/:user_id/achievement_statuses', function(req, res, next) {
        User.findByLogin(req.params.user_id, req, res, next)
            .execOne(false, function(user) {
                return new LifeQuery(AchievementStatus, req, res, next)
                    .modelStatic('findByUser', user.id)
                    .exec();
            });
    });

    app.post('users/:src_user_id/achievement_statuses', function(req, res, next) {
        var ac = new AchievementStatus();

        ac.owner = req.user;

        return new LifeData(AchievementStatus, req, res, next)
            .saveFromRequest(ac, AchievementStatus.validation.creation);
    }, true);

    app.get(routeBase + '/:id', function (req, res, next) {
        return new LifeQuery(AchievementStatus, req, res, next)
            .findById(req.params.id);
    }, true);

    app.delete([
        routeBase + '/:id',
        'users/:src_user_id/achievement_statuses/:id'
    ], function (req, res, next) {
        return new LifeQuery(AchievementStatus, req, res, next)
            .modelStatic('findByUser', req.user.id)
            .modelStatic('findById', req.params.id)
            .remove();
    }, true);

    app.put(routeBase + '/:id', function (req, res, next) {
        return new LifeQuery(AchievementStatus, req, res, next)
            .modelStatic('findByUser', req.user.id)
            .modelStatic('findById', req.params.id)
            .execOne(function(achievement_status) {
                return new LifeData(AchievementStatus, req, res, next)
                    .saveFromRequest(achievement_status,
                            AchievementStatus.validation.edition);
            });
    }, true);

    app.get([
        routeBase + '/:id/approvers',
        routeBase + '/:id/disapprovers'
    ], function (req, res, next) {
        var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

        return new LifeQuery(AchievementStatus, req, res, next)
            .modelStatic('findById', req.params.id)
            .populate('')
            .execOne(false, function(achievement_status) {
                return new LifeQuery(User, req, res, next)
                    .inList(achievement_status[key])
                    .exec();
            });
    });

    app.post([
        routeBase + '/:id/approvers',
        routeBase + '/:id/disapprovers'
    ], function (req, res, next) {
        return new LifeQuery(AchievementStatus, req, res, next)
            .modelStatic('findById', req.params.id)
            .populate('')
            .execOne(false, function(achievement_status) {
                var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';
                var nokey = !isDislikeRoute(req) ? '_non_approvers' : '_approvers';

                if (achievement_status[key].indexOf(req.user.id) === -1) {
                    achievement_status[key].push(req.user.id);
                }

                achievement_status[nokey].remove(req.user.id);

                return new LifeData(AchievementStatus, req, res, next)
                    .save(achievement_status);
            });
    }, true);

    app.delete([
        routeBase + '/:id/approvers',
        routeBase + '/:id/disapprovers',
        routeBase + '/:id/approvers/:src_user_id',
        routeBase + '/:id/disapprovers/:src_user_id'
    ], function (req, res, next) {
        return new LifeQuery(AchievementStatus, req, res, next)
            .modelStatic('findById', req.params.id)
            .populate('')
            .execOne(false, function(achievement_status) {
                var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

                if (achievement_status[key].indexOf(req.user.id) !== -1) {
                    achievement_status[key].remove(req.user.id);
                }

                return new LifeData(AchievementStatus, req, res, next)
                    .save(achievement_status);
            });
    }, true);
};