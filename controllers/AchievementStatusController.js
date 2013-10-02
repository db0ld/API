var _ = require('lodash'),
    mongoose = require('mongoose'),
    AchievementStatus = mongoose.model('AchievementStatus'),
    Achievement = mongoose.model('Achievement'),
    Comment = mongoose.model('Comment'),
    Vote = mongoose.model('Vote'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    User = mongoose.model('User'),
    routeBase = 'achievement_statuses';

module.exports = function (router) {
    router

        .Post('Create an achievement status')
        .route(routeBase)
        .auth(true)
        .input([
            new LifeConstraints.String('message', false),
            new LifeConstraints.AchievementStatusStatus('status'),
            new LifeConstraints.MongooseObjectId(Achievement, 'achievement_id'),
            // new LifeConstraints.Pictures('medias', false)
        ])
        .add(function (context) {
             var achievement_status = context.input;

             achievement_status.owner = context.user().id;
             achievement_status.achievement = context.input.achievement_id.id;

             return new LifeQuery(AchievementStatus, context)
                .save(achievement_status);
        })

        .Put('Update an achievement status')
        .route(routeBase + '/:achievement_status_id')
        .auth(true)
        .input([
            new LifeConstraints.String('message', false),
            new LifeConstraints.AchievementStatusStatus('status', false)
        ])
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id'))
                .byUserId(context.user().id)
                .execOne(function (achievement_status) {
                    this.save(achievement_status, context.input);
                });
        })


        .Get('Get a single achievement status')
        .route(routeBase + '/:achievement_status_id')
        .auth(true)
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id'))
                .execOne();
        })

        .Get('Get achievement statuses')
        .route('users/:user_id/achievement_statuses')
        .route(routeBase)
        .auth(true)
        .add(function (context) {
            var user = context.params('user_id', context.user().id);

            return new LifeQuery(User, context)
                .idOrLogin(user)
                .execOne(function (user) {
                    return new LifeQuery(AchievementStatus, context)
                        .byUserId(user.id)
                        .exec();
                });
        })

        .Post('Add an achievement status comment')
        .route('users/:user_id/achievement_statuses/:achievement_status_id/comments')
        .input([
            new LifeConstraints.String('content', false)
        ])
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id'))
                .execOne(function (achievement_status) {
                    return new LifeQuery(Comment, context)
                        .save({
                            content: context.input.content,
                            author: context.user().id
                        });
                });
        })

        .Get('Get achievement status comments')
        .route('users/:user_id/achievement_statuses/:achievement_status_id/comments')
        .add(function (context) {
            return new LifeQuery(Comment, context)
                .byParent(context.params('achievement_status_id'))
                .exec();
        })

        .Post('Approve an achievement status')
        .route('/users/:user_id/achievement_statuses/:achievement_status_id/approvers')
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id'))
                .execOne(function (achievement_status) {
                    return new LifeQuery(Vote, context)
                        .save({
                            vote: 1,
                            author: context.user().id
                        });
                });
        })

        .Post('Disapprove an achievement status')
        .route('/users/:user_id/achievement_statuses/:achievement_status_id/disapprovers')
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id'))
                .execOne(function (achievement_status) {
                    return new LifeQuery(Vote, context)
                        .save({
                            vote: -1,
                            author: context.user
                        });
                });
        });
};