var LifeQuery = require('../wrappers/LifeQuery.js'),
    AchievementStatus = require('mongoose').model('AchievementStatus'),
    User = require('mongoose').model('User'),
    routeBase = 'achievement_statuses';


var isDislikeRoute = function (req) {
    return req.route.path.match(/disapprovers/) !== null;
};

var approversDisapproversList = function (req, res, next) {
    var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

    return new LifeQuery(AchievementStatus, req, res, next)
        .findById(req.params.achievement_status_id)
        .populate('')
        .execOne(false, function (achievement_status) {
            return new LifeQuery(User, req, res, next)
                .findByIds(achievement_status[key])
                .exec();
        });
};

var approversDisapproversAdd = function (req, res, next) {
    return new LifeQuery(AchievementStatus, req, res, next)
        .findById(req.params.achievement_status_id)
        .populate('')
        .execOne(false, function (achievement_status) {
            var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers',
                nokey = !isDislikeRoute(req) ? '_non_approvers' : '_approvers';

            if (achievement_status[key].indexOf(req.user.id) === -1) {
                achievement_status[key].push(req.user.id);
            }

            achievement_status[nokey].remove(req.user.id);

            return new LifeQuery(AchievementStatus, req, res, next)
                .save(achievement_status);
        });
};

var approversDisapproversDelete = function (req, res, next) {
    return new LifeQuery(AchievementStatus, req, res, next)
        .findById(req.params.achievement_status_id)
        .populate('')
        .execOne(false, function (achievement_status) {
            var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

            if (achievement_status[key].indexOf(req.user.id) !== -1) {
                achievement_status[key].remove(req.user.id);
            }

            return new LifeQuery(AchievementStatus, req, res, next)
                .save(achievement_status);
        });
};

module.exports = function (router) {

    router

        .Get('Get user achievement statuses')
        .route('users/:user_id/achievement_statuses')
        .list(AchievementStatus)
        .add(function (req, res, next) {
            new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    return new LifeQuery(AchievementStatus, req, res, next)
                        .findByUser(user.id)
                        .exec();
                });
        })


        .Post('Post an achievement status')
        .route('users/:src_user_id/achievement_statuses')
        .input(AchievementStatus.validation.creation)
        .output(AchievementStatus)
        .auth(true)
        .add(function (req, res, next, params) {
            var ac = new AchievementStatus();

            ac.owner = req.user;

            return new LifeQuery(AchievementStatus, req, res, next)
                .save(ac, params);
        })


        .Get('Get an achievement status')
        .route(routeBase + '/:achievement_status_id')
        .output(AchievementStatus)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findById(req.params.achievement_status_id)
                .execOne();
        })


        .Delete('Remove an achievement status')
        .route(routeBase + '/:achievement_status_id')
        .route('users/:src_user_id/achievement_statuses/:achievement_status_id')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findByUser(req.user.id)
                .findById(req.params.achievement_status_id)
                .remove();
        })


        .Put('Edit an achievement status')
        .route(routeBase + '/:achievement_status_id')
        .input(AchievementStatus.validation.edition)
        .output(AchievementStatus)
        .auth(true)
        .add(function (req, res, next, params) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findByUser(req.user.id)
                .findById(req.params.achievement_status_id)
                .execOne(function (achievement_status) {
                    return new LifeQuery(AchievementStatus, req, res, next)
                        .save(achievement_status, params);
                });
        })


        .Get('Get an achievement status approvers')
        .route(routeBase + '/:achievement_status_id/approvers')
        .list(User)
        .add(approversDisapproversList)


        .Get('Get an achievement status disapprovers')
        .route(routeBase + '/:achievement_status_id/disapprovers')
        .list(User)
        .add(approversDisapproversList)


        .Post('Approve an achievement')
        .route(routeBase + '/:achievement_status_id/approvers')
        .input([])
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversAdd)


        .Post('Disapprove an achievement')
        .route(routeBase + '/:achievement_status_id/disapprovers')
        .input([])
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversAdd)


        .Delete('Remove an achievement approval')
        .route(routeBase + '/:achievement_status_id/approvers')
        .route(routeBase + '/:achievement_status_id/disapprovers')
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversDelete)


        .Delete('Remove an achievement disapproval')
        .route(routeBase + '/:achievement_status_id/approvers/:src_user_id')
        .route(routeBase + '/:achievement_status_id/disapprovers/:src_user_id')
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversDelete);

};