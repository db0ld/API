var LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    AchievementStatus = require('mongoose').model('AchievementStatus'),
    User = require('mongoose').model('User'),
    routeBase = 'achievement_statuses';


var isDislikeRoute = function(req) {
    return req.route.path.match(/disapprovers/) !== null;
};

var approversDisapproversList = function (req, res, next) {
    var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

    return new LifeQuery(AchievementStatus, req, res, next)
        .modelStatic('findById', req.params.achievement_status_id)
        .populate('')
        .execOne(false, function(achievement_status) {
            return new LifeQuery(User, req, res, next)
                .inList(achievement_status[key])
                .exec();
        });
};

var approversDisapproversAdd = function (req, res, next) {
    return new LifeQuery(AchievementStatus, req, res, next)
        .modelStatic('findById', req.params.achievement_status_id)
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
};

var approversDisapproversDelete = function (req, res, next) {
    return new LifeQuery(AchievementStatus, req, res, next)
        .modelStatic('findById', req.params.achievement_status_id)
        .populate('')
        .execOne(false, function(achievement_status) {
            var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

            if (achievement_status[key].indexOf(req.user.id) !== -1) {
                achievement_status[key].remove(req.user.id);
            }

            return new LifeData(AchievementStatus, req, res, next)
                .save(achievement_status);
        });
};

module.exports = function(router) {

    (router)


    .Get('users/:user_id/achievement_statuses')
        .doc('Get user achievement statuses')
        .list(AchievementStatus)
        .add(function(req, res, next) {
            User.findByLogin(req.params.user_id, req, res, next)
                .execOne(false, function(user) {
                    return new LifeQuery(AchievementStatus, req, res, next)
                        .modelStatic('findByUser', user.id)
                        .exec();
                });
        })


    .Post('users/:src_user_id/achievement_statuses')
        .doc('Post an achievement status')
        .input(AchievementStatus.validation.creation)
        .output(AchievementStatus)
        .auth(true)
        .add(function(req, res, next, params) {
            var ac = new AchievementStatus();

            ac.owner = req.user;

            return new LifeData(AchievementStatus, req, res, next)
                .mergeSave(ac, params);
        })


    .Get(routeBase + '/:achievement_status_id')
        .doc('Get an achievement status')
        .output(AchievementStatus)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findById(req.params.achievement_status_id);
        })


    .Delete(routeBase + '/:achievement_status_id')
        .route('users/:src_user_id/achievement_statuses/:achievement_status_id')
        .doc('Remove an achievement status')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .modelStatic('findByUser', req.user.id)
                .modelStatic('findById', req.params.achievement_status_id)
                .remove();
        })


    .Put(routeBase + '/:achievement_status_id')
        .doc('Edit an achievement status')
        .input(AchievementStatus.validation.edition)
        .output(AchievementStatus)
        .auth(true)
        .add(function (req, res, next, params) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .modelStatic('findByUser', req.user.id)
                .modelStatic('findById', req.params.achievement_status_id)
                .execOne(function(achievement_status) {
                    return new LifeData(AchievementStatus, req, res, next)
                        .mergeSave(achievement_status, params);
                });
        })

    .Get(routeBase + '/:achievement_status_id/approvers')
        .doc('Get an achievement status approvers')
        .list(User)
        .add(approversDisapproversList)


    .Get(routeBase + '/:achievement_status_id/disapprovers')
        .doc('Get an achievement status disapprovers')
        .list(User)
        .add(approversDisapproversList)


    .Post(routeBase + '/:achievement_status_id/approvers')
        .doc('Approve an achievement')
        .input({})
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversAdd)


    .Post(routeBase + '/:achievement_status_id/disapprovers')
        .doc('Disapprove an achievement')
        .input({})
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversAdd)


    .Delete(routeBase + '/:achievement_status_id/approvers')
        .route(routeBase + '/:achievement_status_id/disapprovers')
        .doc('Remove an achievement approval')
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversDelete)

    .Delete(routeBase + '/:achievement_status_id/approvers/:src_user_id')
        .route(routeBase + '/:achievement_status_id/disapprovers/:src_user_id')
        .doc('Remove an achievement disapproval')
        .output(AchievementStatus)
        .auth(true)
        .add(approversDisapproversDelete);

};