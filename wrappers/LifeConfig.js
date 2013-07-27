/**
 * Gets the configuration in app.js and app_dev.js if present
 *
 * @module LifeConfig
 */
var fs = require('fs'),
    config = require('../configurations/app.js'),
    config_dev,
    key;

module.exports = config;

if (fs.existsSync('./configurations/app_dev.js')) {
    config_dev = require('../configurations/app_dev.js');

    for (key in config_dev) {
        if (config_dev.hasOwnProperty(key)) {
            module.exports[key] = config_dev[key];
        }
    }
}
