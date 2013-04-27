var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

var lifeRouter = function(app) {
	this.app = app;
};

/*
 * Allows us to catch LifeErrors
 * ... will also be useful for auth and stuff like that
 */

['get', 'post', 'put', 'delete', 'patch', 'head']
	.forEach(function(method) {
		lifeRouter.prototype[method] = function(endpoint, cb) {
			this.app[method](api_utils.makePath(endpoint), function(req, res, next) {
				return cb(req, res, function(err) {
                    return api_utils.apiResponse(res, req, null, err);
                });
			});
		};
	});

module.exports = lifeRouter;