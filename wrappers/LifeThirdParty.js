var fs = require('fs');

/**
 * A class listing all errors returned by the API
 *
 * @class LifeThirdParty
 * @constructor
 */
var LifeThirdParty = {};

fs.readdirSync(__dirname + '/LifeThirdParty').forEach(function (file) {
    if (file.match(/\.js$/) && file != 'Abstract.js') {
        var name = file.substring(0, file.length - 3);
        var provider = require(__dirname + '/LifeThirdParty/' + file);

        LifeThirdParty[name.toLowerCase()] = provider;
    }
});


module.exports = LifeThirdParty;