var User = require('mongoose').model('User');
var OAuthToken = require('mongoose').model('OAuthToken');
var LifeResponse = require('../wrappers/LifeResponse.js');
var LifeSecurity = require('../wrappers/LifeSecurity.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeData = require('../wrappers/LifeData.js');
var bcrypt = require('bcryptjs');

module.exports = function(app) {
    app.post(['tokens'], function(req, res, next) {
        var params = new LifeData(null, req, res, next).whitelist(OAuthToken.creationValidation);

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
    });

    app.get(['tokens', 'users/:login/tokens'], function(req, res, next) {
        return User.findByLogin(req.security.getLogin(req.params.login), req, res, next).execOne(false, function(user) {
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
