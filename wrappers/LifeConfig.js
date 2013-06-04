/**
 * Gets the configuration in app.js and app_dev.js if present
 *
 * @module LifeConfig
 */
var fs = require('fs');
var config = require('../configurations/app.js');

module.exports = config;

if (fs.existsSync('./configurations/app_dev.js')) {
	var config_dev = require('../configurations/app_dev.js');

	for (var key in config_dev) {
		module.exports[key] = config_dev[key];
	}
}
