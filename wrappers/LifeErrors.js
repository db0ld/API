var fs = require('fs');

/**
 * A class listing all errors returned by the API
 *
 * @class LifeErrors
 * @constructor
 */
var LifeErrors = function () {

};

fs.readdirSync(__dirname + '/LifeErrors').forEach(function (file) {
    if (file.match(/\.js$/) && file !== 'Errors.js') {
        var name = file.substring(0, file.length - 3);
        var errorType = require(__dirname + '/LifeErrors/' + file);

        LifeErrors[name] = function (details) {
            for (var i in errorType) {
                if (errorType.hasOwnProperty(i)) {
                    this[i] = errorType[i];
                }
            }

            this.details = details;
        };

        LifeErrors[name].prototype = new LifeErrors();
        LifeErrors[name].prototype.constructor = LifeErrors;
    }
});


module.exports = LifeErrors;