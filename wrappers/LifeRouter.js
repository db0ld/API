var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

var lifeRouter = function(app) {
	this.app = app;
};

/*
 * Allows us to catch LifeErrors
 */

['get', 'post', 'put', 'delete', 'patch', 'head']
	.forEach(function(method) {
		lifeRouter.prototype[method] = function(endpoint, cb) {
			this.app[method](api_utils.makePath(endpoint), function(req, res) {
				try {
					return cb(req, res);
				} catch (lifeError) {
					console.error("Some shitty error just happened");
					console.error(lifeError);
					return api_utils.apiResponse(res, req, null, lifeError);
				}
			});
		};
	});

module.exports = lifeRouter;