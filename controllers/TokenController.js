var User = require('mongoose').model('User'),
    OAuthToken = require('mongoose').model('OAuthToken'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeData = require('../wrappers/LifeData.js'),
    bcrypt = require('bcryptjs');

module.exports = function(method) {

    (method)


    .Post('tokens')
        .doc('Create a token for a user')
        .input(OAuthToken.creationValidation)
        .output(OAuthToken)
        .error(LifeErrors.AuthenticationError)
        .add(function(req, res, next, params) {
            if (LifeData.isObjectId(params.login)) {
                return next(LifeErrors.AuthenticationError);
            }

            User.findByLogin(params.login, req, res, next).execOne(true, function(user) {
                if (!user || !bcrypt.compareSync(params.password, user.password)) {
                    return next(LifeErrors.AuthenticationError);
                }

                var token = new OAuthToken();
                token.expiration = new Date();
                token.expiration.setDate(token.expiration.getDate() + 7);
                token.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + token.expiration.getTime();
                token.user = user;

                return new LifeData(OAuthToken, req, res, next).save(token);
            });
        })


    .Get('tokens')
        .route('users/:login/tokens')
        .doc('Get tokens')
        .list(OAuthToken)
        .auth(true)
        .add(function(req, res, next) {
            return User.findByLogin(req.security.getLogin(req.params.login), req, res, next).execOne(false, function(user) {
                return new LifeQuery(OAuthToken, req, res, next)
                    .modelStatic('findByUserId', user.id)
                    .exec();
            });
        })


    .Get('tokens/:token')
        .doc('Get a single token')
        .list(OAuthToken)
        .auth(true)
        .add(function(req, res, next) {
            return new LifeQuery(OAuthToken, req, res, next)
                .modelStatic('findByToken', req.params.token)
                .execOne();
        })


    .Delete('tokens/:token')
        .route('users/:login/tokens/:token')
        .doc('Remove an access token')
        .output(Number)
        .auth(true)
        .add(function(req, res, next) {
            return new LifeQuery(OAuthToken, req, res, next)
                .modelStatic('findByToken', req.params.token)
                .remove();
        });
};
