var LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Client = mongoose.model('Client'),
    routeBase = 'oauth';

module.exports = function (router) {
    router

        .Post('Log user using a third party OAuth token')
        .route(routeBase + '/external')
        .input([
            new LifeConstraints.OAuthCouple()
        ])
        .add(function (context) {
            new LifeQuery(User, context)
                .searchByOAuthToken(context.input.site_name, context.input.site_token_user.id)
                .execOne(function (user) {
                    if (!user) {
                        return context.send.error(new LifeErrors.AuthenticationError());
                    }

                    var client = Client.buildToken(context, user);

                    return new LifeQuery(Client, context).save(client);
                });
        })
        ;
};