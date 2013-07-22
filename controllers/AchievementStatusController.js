var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var AchievementStatus = require('mongoose').model('AchievementStatus');
var User = require('mongoose').model('User');


var isDislikeRoute = function(req) {
    return req.route.path.match(/disapprovers/) !== null;
};

var approversDisapproversList = function (req, res, next) {
    var key = isDislikeRoute(req) ? '_non_approvers' : '_approvers';

    return new LifeQuery(AchievementStatus, req, res, next)
        .modelStatic('findById', req.params.id)
        .populate('')
        .execOne(false, function(achievement_status) {
            return new LifeQuery(User, req, res, next)
                .inList(achievement_status[key])
                .exec();
        });
};

var approversDisapproversAdd = function (req, res, next) {
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
};

var approversDisapproversDelete = function (req, res, next) {
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
};

var routeBase = 'achievement_statuses';

module.exports = function(router) {

    (router)


    .Get('users/:user_id/achievement_statuses')
        .doc('Get user achievement statuses')
        .list()
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
        .auth(true)
        .add(function(req, res, next) {
            var ac = new AchievementStatus();

            ac.owner = req.user;

            return new LifeData(AchievementStatus, req, res, next)
                .saveFromRequest(ac, AchievementStatus.validation.creation);
        })


    .Get(routeBase + '/:id')
        .doc('Get an achievement status')
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .findById(req.params.id);
        })


    .Delete(routeBase + '/:id')
        .route('users/:src_user_id/achievement_statuses/:id')
        .doc('Remove an achievement status')
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .modelStatic('findByUser', req.user.id)
                .modelStatic('findById', req.params.id)
                .remove();
        })


    .Put(routeBase + '/:id')
        .doc('Edit an achievement status')
        .add(function (req, res, next) {
            return new LifeQuery(AchievementStatus, req, res, next)
                .modelStatic('findByUser', req.user.id)
                .modelStatic('findById', req.params.id)
                .execOne(function(achievement_status) {
                    return new LifeData(AchievementStatus, req, res, next)
                        .saveFromRequest(achievement_status,
                                AchievementStatus.validation.edition);
                });
        })

    .Get(routeBase + '/:id/approvers')
        .doc('Get an achievement status approvers')
        .list()
        .add(approversDisapproversList)


    .Get(routeBase + '/:id/disapprovers')
        .doc('Get an achievement status disapprovers')
        .list()
        .add(approversDisapproversList)


    .Post(routeBase + '/:id/approvers')
        .doc('Approve an achievement')
        .auth(true)
        .add(approversDisapproversAdd)


    .Post(routeBase + '/:id/disapprovers')
        .doc('Disapprove an achievement')
        .auth(true)
        .add(approversDisapproversAdd)


    .Delete(routeBase + '/:id/approvers')
        .route(routeBase + '/:id/disapprovers')
        .doc('Remove an achievement approval')
        .auth(true)
        .add(approversDisapproversDelete)

    .Delete(routeBase + '/:id/approvers/:src_user_id')
        .route(routeBase + '/:id/disapprovers/:src_user_id')
        .doc('Remove an achievement disapproval')
        .auth(true)
        .add(approversDisapproversDelete);

};