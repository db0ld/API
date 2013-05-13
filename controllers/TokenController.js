var User = require('mongoose').model('User');
var OAuthToken = require('mongoose').model('OAuthToken');
var LifeResponse = require('../wrappers/LifeResponse.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeData = require('../wrappers/LifeData.js');

module.exports = function(app) {
    app.post(['tokens'], function(req, res, next) {
        User.findByCredentials(req.body.login, req.body.password, req, res, next).execOne(function(user) {
            if (!user) {
                return next(LifeErrors.UserNotFound);
            }

            oneWeekLater = new Date();
            oneWeekLater.setDate (oneWeekLater.getDate() + 7);

            var token = new OAuthToken();
            token.token = user.login + '-' + Math.floor(Math.random() *  4294967295) + '-' + oneWeekLater.getTime();
            token.expiration = oneWeekLater;

            user.oauth_tokens.push(token);

            return new LifeData(User, req, res).save(user, next, function(data) {
                return new LifeResponse.send(req, res, token);
            });
        });
    });

    app.get(['tokens', 'users/:login/tokens'], function(req, res, next) {
        if (!req.params.login) {
            if (req.token && req.token.user && req.token.user.login) {
                req.params.login = req.token.user.login;
            } else {
                return next(LifeErrors.AuthenticationRequired);
            }
        }

        return next(LifeErrors.UserNotFound);
    });

    app.get(['tokens/:token'], function(req, res, next) {
    });

    app.delete(['tokens/:id', 'users/:login/tokens/:id'], function(req, res, next) {
    });
};