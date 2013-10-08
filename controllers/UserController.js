var _ = require('lodash'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Client = mongoose.model('Client'),
    bcrypt = require('bcryptjs'),
    routeBase = 'users';

module.exports = function (router) {
    router

        .Post('Create a user')
        .input([
                new LifeConstraints.Length(2, 32, 'login')
                    .add(new LifeConstraints.MongooseUnique(User, 'login', 'login')),
                new LifeConstraints.Or([
                    new LifeConstraints.Password(6, 'password', false),
                    new LifeConstraints.OAuthCouple(false)
                ]),
                new LifeConstraints.Email('email')
                    .add(new LifeConstraints.MongooseUnique(User, 'email', 'email')),
                new LifeConstraints.Length(2, 32, 'firstname', false),
                new LifeConstraints.Length(2, 32, 'lastname', false),
                new LifeConstraints.Gender('gender', false),
                new LifeConstraints.Date('birthday', false),
                // new LifeConstraints.Picture('avatar', false),
            ])
        .route(routeBase)
        .add(function (context) {
            var user = new User(_.cloneDeep(context.input));

            if (context.input.site_name && context.input.site_token_user) {
                return new LifeQuery(User, context)
                    .searchByOAuthToken(context.input.site_name, context.input.site_token_user.id)
                    .execOne(true, function (found_user) {
                        if (found_user) {
                            return context.send.error(new LifeErrors.UserExtTokenAlreadyRegistered());
                        }

                        user._oauth.push({
                            site: context.input.site_name,
                            user_id: context.input.site_token_user.id
                        });

                        return new LifeQuery(User, context).save(user);
                    });
            }

            return new LifeQuery(User, context).save(user);
        })

        .Get('Get a user')
        .route(routeBase + '/:id')
        .add(function (context) {
            return new LifeQuery(User, context)
                .idOrLogin(context.params('id'))
                .execOne();
        })

        .Get('Get users')
        .route(routeBase)
        .add(function (context) {
            return new LifeQuery(User, context)
                .exec();
        })

        .Post('Create a token')
        .route(routeBase + '/:id/tokens')
        .input([
                new LifeConstraints.String('password'),
                new LifeConstraints.String('ip', false)
            ])
        .add(function (context) {
            return new LifeQuery(User, context)
                .loginOrEmail(context.params('id'))
                .execOne(true, function (user) {
                    if (!user || ! user._password) {
                        return context.send.error(new LifeErrors.AuthenticationError());
                    }

                    return bcrypt.compare(context.input.password, user._password, function (err, res) {
                        if (err || !res) {
                            return context.send.error(new LifeErrors.AuthenticationError());
                        }

                        if (!context.application) {
                            return context.send.error(new LifeErrors.AuthenticationError('Unknown client'));
                        }

                        var client = Client.buildToken(context, user);

                        return new LifeQuery(Client, context).save(client);
                    });
                });
        })

        .Delete('Remove a token')
        .route(routeBase + '/:id/tokens/:token')
        .add(function(context) {
            return new LifeQuery(Client, context)
                .token(context.params('token'))
                .remove();
        });

};