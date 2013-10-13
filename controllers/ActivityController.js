var mongoose = require('mongoose'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    Activity = mongoose.model('Activity'),
    routeBase = 'activities';

module.exports = function (router) {
    router

        .Get('Get activities for user')
        .route('users/:user_id/activities')
        .params([
            new LifeConstraints.UserIdLogin('user_id', true, true, true),
        ])
        .add(function (context) {
            return new LifeQuery(Activity, context)
                .findByOwner(context.params('user_id'))
                .exec();
        })

        .Get('Get a single achievement status')
        .route('activities/:activity_id')
        .params([
            new LifeConstraints.MongooseObjectId(Activity, 'activity_id'),
        ])
        .add(function (context) {
            return context.send.single(context.params('activity_id'));
        })
};