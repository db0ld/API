var fs = require('fs');
var LifeSecurity = require('./LifeSecurity.js');
var LifeResponse = require('./LifeResponse.js');
var LifeConfig = require('./LifeConfig.js');
var LifeErrors = require('./LifeErrors.js');

var LifeRouter = function(app) {
    this.app = app;
};

LifeRouter.prototype.init = function() {
    var that = this;

    // blocking readdir, never mind, only launched at app initialization
    fs.readdirSync('./controllers').forEach(function(file) {
        if (file.match(/\.js$/)) {
            require('../controllers/' + file)(that);
        }
    });
};

var makePath = function(res) {
  return LifeConfig['api_path'] + 'v' + LifeConfig['version'] + '/' + res;
};

['get', 'post', 'put', 'delete', 'patch', 'head']
    .forEach(function(method) {
        LifeRouter.prototype[method] = function(endpoint, cb, authentication) {
            var that = this;

            if (typeof endpoint === "string") {
                endpoint = [endpoint];
            }

            endpoint = endpoint.map(function(item) {
                return makePath(item);
            });

            endpoint.forEach(function(route) {
                that.app[method](route, function(req, res, next) {
                    return LifeSecurity.authenticationWrapper(req, res, authentication, function(err) {
                           return LifeResponse.send(req, res, null, LifeErrors.AuthenticationError);
                        }, function(req, res, next) {
                        return cb(req, res, function(err) {
                            if (typeof req.query.locale !== 'undefined') {
                                req.locale = req.query.locale;
                            } else if (typeof req.query.locale === 'undefined' && typeof req.token !== 'undefined') {
                                req.locale = req.token.user.locale;
                            }

                            return LifeResponse.send(req, res, null, err);
                        });
                    });
                });
            });
        };
    });

module.exports = LifeRouter;