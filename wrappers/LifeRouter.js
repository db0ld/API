var fs = require('fs');
var LifeSecurity = require('./LifeSecurity.js');
var LifeResponse = require('./LifeResponse.js');
var LifeConfig = require('./LifeConfig.js');
var LifeErrors = require('./LifeErrors.js');

/**
 * An utility class that routes requests on top of ExpressJS.
 *
 * @class LifeRouter
 * @constructor
 */
var LifeRouter = function(app) {
    this.app = app;
};

/**
 * Init routing
 *
 * @method
 */
LifeRouter.prototype.init = function() {
    var that = this;

    // blocking readdir, never mind, only launched at app initialization
    fs.readdirSync('./controllers').forEach(function(file) {
        if (file.match(/\.js$/)) {
            require('../controllers/' + file)(that);
        }
    });
};

/**
 * Create an API path, with current version and prefix
 *
 * @param {String} res
 * @function
 */
LifeRouter.makePath = function(res) {
  return LifeConfig['api_path'] + 'v' + LifeConfig['version'] + '/' + res;
};

['get', 'post', 'put', 'delete', 'patch', 'head']
    .forEach(function(method) {
        LifeRouter.prototype[method] = function(endpoint, cb, auth) {
            var that = this;

            if (typeof endpoint === 'string') {
                endpoint = [endpoint];
            }

            endpoint = endpoint.map(function(item) {
                return LifeRouter.makePath(item);
            });

            endpoint.forEach(function(route) {
                that.app[method](route, function(req, res, next) {
                    return new LifeSecurity(req, res, auth,
                        function(err) {
                           err = err ? err : LifeErrors.AuthenticationError;
                           return LifeResponse.send(req, res, null, err);
                        }, function(req, res, next) {
                            if (typeof req.query.lang !== 'undefined') {
                                req.lang = req.query.lang;
                            } else if (typeof req.body.lang !== 'undefined') {
                                req.lang = req.body.lang;
                            }

			    if (LifeConfig.dev) {
				console.log(new Date());
				console.log(method + ':' + req.url + '(' + route + ')');
				console.log('PARAMS POST: ' + JSON.stringify(req.body, null, 4));
				console.log('PARAMS GET : ' + JSON.stringify(req.query, null, 4));
				console.log();
				console.log();
				console.log();
			    }

			    // Overwrite missing parameters
			    req.query.lang = req.lang;
			    req.body.lang = req.lang;
			    

                            return cb(req, res, function(err) {
                                return LifeResponse.send(req, res, null, err);
                            });
                        }
                    );
                });
            });
        };
    });

module.exports = LifeRouter;
