var _ = require('lodash'),
    mongoose = require('mongoose'),
    AchievementStatus = mongoose.model('AchievementStatus'),
    Achievement = mongoose.model('Achievement'),
    Comment = mongoose.model('Comment'),
    Vote = mongoose.model('Vote'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
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
            new LifeConstraints.Picture('media', false, {output_picture: true}),
        ])
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .byUserId(context.user().id)
                .byAchievement(context.input.achievement_id.id)
                .execOne(true, function (achievement_status) {
                    if (achievement_status) {
                        return context.send.error(new LifeErrors.UserLogicError());
                    }

                    achievement_status = context.input;

                    if (context.input.media) {
                        achievement_status.medias.push(context.input.media);
                        delete achievement_status.media;
                    }

                    achievement_status.owner = context.user().id;
                    achievement_status.achievement = context.input.achievement_id.id;

                    return new LifeQuery(AchievementStatus, context)
                       .save(achievement_status);
                });
        })

        .Put('Update an achievement status')
        .route(routeBase + '/:achievement_status_id')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .input([
            new LifeConstraints.String('message', false),
            new LifeConstraints.AchievementStatusStatus('status', false)
        ])
        .add(function (context) {
            return new LifeQuery(AchievementStatus, context)
                .findById(context.params('achievement_status_id').id)
                .byUserId(context.user().id)
                .execOne(function (achievement_status) {
                    this.save(achievement_status, context.input);
                });
        })


        .Get('Get a single achievement status')
        .route(routeBase + '/:achievement_status_id')
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .add(function (context) {
            return context.send.single(context.params('achievement_status_id'));
        })

        .Get('Get achievement statuses')
        .route('users/:user_id/achievement_statuses')
        .params([
            new LifeConstraints.UserIdLogin('user_id', true, true, true),
        ])
        .add(function (context) {
            var user = context.params('user_id');

            return new LifeQuery(AchievementStatus, context)
                .byUserId(user.id)
                .exec();
        })

        .Post('Add an achievement status comment')
        .route('achievement_statuses/:achievement_status_id/comments')
        .input([
            new LifeConstraints.String('content', false)
        ])
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .auth(true)
        .add(function (context) {
            return new LifeQuery(Comment, context)
                .save({
                    content: context.input.content,
                    author: context.user().id,
                    parent: context.params('achievement_status_id')
                });
        })

        .Get('Get achievement status comments')
        .route('achievement_statuses/:achievement_status_id/comments')
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .add(function (context) {
            return new LifeQuery(Comment, context)
                .byParent(context.params('achievement_status_id'))
                .exec();
        })

        .Post('Approve an achievement status')
        .route('achievement_statuses/:achievement_status_id/approvers')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .add(function (context) {
            return Vote.registerUserVote(context, context.user(), context.params('achievement_status_id'), 1);
        })

        .Post('Disapprove an achievement status')
        .route('achievement_statuses/:achievement_status_id/disapprovers')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .add(function (context) {
            return Vote.registerUserVote(context, context.user(), context.params('achievement_status_id'), -1);
        })


        .Delete('Remove an achievement approval')
        .route('achievement_statuses/:achievement_status_id/approvers')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(AchievementStatus, 'achievement_status_id'),
        ])
        .add(function (context) {
            return Vote.removeUserVote(context, context.user(), context.params('achievement_status_id'))
        })
        ;
};