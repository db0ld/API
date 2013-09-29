var LifeConstraints = require('../wrappers/LifeConstraints.js'),
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
                new LifeConstraints.Password(6, 'password'),
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
            return new LifeQuery(User, context).save(context.input);
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
                    if (!user) {
                        return context.send.error(LifeErrors.AuthenticationError);
                    }

                    return bcrypt.compare(context.input.password, user._password, function (err, res) {
                        if (err || !res) {
                            return context.send.error(new LifeErrors.AuthenticationError());
                        }

                        if (!context.application) {
                            return context.send.error(new LifeErrors.AuthenticationError('Unknown client'));
                        }

                        var expiration = new Date();
                        expiration.setDate(expiration.getDate() + 7);

                        client = new Client();
                        client.expiration = expiration;
                        client.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + expiration.getTime();
                        client.user = user;
                        client.application = context.application;
                        client.ip = context.input.ip || context.connection('remoteAddress');

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