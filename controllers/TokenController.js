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
            token.tokenKey = user.login + '-' + Math.floor(Math.random() *  4294967295);
            token.expiration = oneWeekLater;

            user.oauth_tokens.push(token);

            return new LifeData(User, req, res).save(user, next, function(data) {
                return new LifeResponse.send(req, res, token);
            });
        });
    });

    app.get(['tokens', 'users/:login/tokens'], function(req, res, next) {
        return next(LifeErrors.NotImplemented);
    });

    app.get(['tokens/:token'], function(req, res, next) {
        return User.findByOauthToken(req.params.token, req, res, next).execOne(function(user) {
            var found = false;

            user.oauth_tokens.forEach(function(item) {
                if (item.token === req.params.token) {
                    found = true;
                    return new LifeResponse.send(req, res, item);
                }
            });

            if (!found) {
                return next(LifeErrors.NotFound);
            }
        });
    });

    app.delete(['tokens/:id', 'users/:login/tokens/:id'], function(req, res, next) {
        return User.findByOauthToken(req.params.token, req, res, next).execOne(function(user) {
            var token = false;

            user.oauth_tokens = user.oauth_tokens.filter(function(item) {
                if (item.token === req.params.token) {
                    token = item;
                }

                return item.token !== req.params.token;
            });

            return new LifeData(User, req, res).save(user, next, function(data) {
                return new LifeResponse.send(req, res, token);
            });
        });
    });
};