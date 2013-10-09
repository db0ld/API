var LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    UserConnection = mongoose.model('UserConnection'),
    routeBase = 'network';

module.exports = function (router) {
    router

        .Post('Add user to game network')
        .route(routeBase + '/:user_id')
        .auth(true)
        .add(function (context) {
            return new LifeQuery(User, context)
                .idOrLogin(context.user().id)
                .execOne(function (user) {
                    return new LifeQuery(UserConnection, context)
                        .selfOtherRelation(context.user().id, user.id, 'network')
                        .execOne(true, function (connection) {
                            if (connection) {
                                return context.send.error(new LifeErrors.UserLogicError());
                            }

                            this.save({
                                self: context.user().id,
                                other: user,
                                relation: 'network'
                            });
                        });
                });
        })

        .Delete('Remove user from game network')
        .route(routeBase + '/:user_id')
        .auth(true)
        .add(function (context) {
            return new LifeQuery(UserConnection, context)
                .selfOtherRelation(context.user().id, context.params('user_id'), 'network')
                .remove();
        })

        .Get('Get users from game network')
        .route(routeBase)
        .auth(true)
        .add(function (context) {
            return new LifeQuery(UserConnection, context)
                .selfRelation(context.user().id, 'network')
                .populate("")
                .exec(function (relations) {
                    var user_ids = relations.map(function (relation) {
                        return relation.other;
                    });

                    return new LifeQuery(User, context)
                        .findByIds(user_ids)
                        .exec();
                });
        })

        .Get('Get the users who have me in their Game Network')
        .route('others_network')
        .auth(true)
        .add(function (context) {
            return new LifeQuery(UserConnection, context)
                .otherRelation(context.user().id, 'network')
                .populate("")
                .exec(function (relations) {
                    var user_ids = relations.map(function (relation) {
                        return relation.self;
                    });

                    return new LifeQuery(User, context)
                        .findByIds(user_ids)
                        .exec();
                });
        })
        ;
};