var User = require('mongoose').model('User');
var OAuthToken = require('mongoose').model('OAuthToken');
var LifeResponse = require('../wrappers/LifeResponse.js');
var LifeSecurity = require('../wrappers/LifeSecurity.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeData = require('../wrappers/LifeData.js');

module.exports = function(app) {
    app.post(['tokens'], function(req, res, next) {
        User.findByCredentials(req.body.login, req.body.password, req, res, next).execOne(false, function(user) {
            if (!user) {
                return next(LifeErrors.NotFound);
            }

            var token = new OAuthToken();
            token.expiration = new Date();
            token.expiration.setDate(token.expiration.getDate() + 7);
            token.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + token.expiration.getTime();
            token.user = user;

            return new LifeData(OAuthToken, req, res, next).save(token);
        });
    });

    app.get(['tokens', 'users/:login/tokens'], function(req, res, next) {
        if (!LifeSecurity.hasRole(req, LifeSecurity.roles.USER_MANAGEMENT) &&
            req.params.login != req.token.user.login) {
            return next(LifeErrors.NotFound);
        }

        return User.findByLogin(req.params.login ? req.params.login : req.token.user.login, req, res, next).execOne(false, function(user) {
            return new LifeQuery(OAuthToken, req, res, next)
                .modelStatic('findByUserId', user.id)
                .exec();
        });
    });

    app.get(['tokens/:token'], function(req, res, next) {
        return new LifeQuery(OAuthToken, req, res, next)
            .modelStatic('findByToken', req.params.token)
            .execOne();
    });

    app.delete(['tokens/:token', 'users/:login/tokens/:token'], function(req, res, next) {
        return new LifeQuery(OAuthToken, req, res, next)
            .modelStatic('findByToken', req.params.token)
            .remove();
    });
};