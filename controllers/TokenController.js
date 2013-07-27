var User = require('mongoose').model('User'),
    OAuthToken = require('mongoose').model('OAuthToken'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeData = require('../wrappers/LifeData.js'),
    bcrypt = require('bcryptjs');

module.exports = function (method) {

    method


        .Post('Create a token for a user')
        .route('tokens')
        .input(OAuthToken.creationValidation)
        .output(OAuthToken)
        .error(LifeErrors.AuthenticationError)
        .add(function (req, res, next, params) {
            if (LifeData.isObjectId(params.login)) {
                return next(LifeErrors.AuthenticationError);
            }

            return new LifeQuery(User, req, res, next)
                .findByLogin(params.login).execOne(true, function (user) {
                    if (!user || !bcrypt.compareSync(params.password, user.password)) {
                        return next(LifeErrors.AuthenticationError);
                    }

                    var token = new OAuthToken();
                    token.expiration = new Date();
                    token.expiration.setDate(token.expiration.getDate() + 7);
                    token.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + token.expiration.getTime();
                    token.user = user;

                    return new LifeQuery(OAuthToken, req, res, next).save(token);
                });
        })


        .Get('Get tokens')
        .route('tokens')
        .route('users/:user_id/tokens')
        .list(OAuthToken)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.security.getLogin(req.params.user_id))
                .execOne(false, function (user) {
                    return new LifeQuery(OAuthToken, req, res, next)
                        .findByUserId(user.id)
                        .exec();
                });
        })


        .Get('Get a single token')
        .route('tokens/:token')
        .list(OAuthToken)
        .add(function (req, res, next) {
            return new LifeQuery(OAuthToken, req, res, next)
                .findByToken(req.params.token)
                .execOne();
        })


        .Delete('Remove an access token')
        .route('tokens/:token')
        .output(Number)
        .add(function (req, res, next) {
            return new LifeQuery(OAuthToken, req, res, next)
                .findByToken(req.params.token)
                .remove();
        });
};
