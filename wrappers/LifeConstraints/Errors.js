var fs = require('fs');

/**
 * A class listing all validation errors returned by the API
 *
 * @class Errors
 * @constructor
 */
var Errors = function () {

};

fs.readdirSync(__dirname + '/Errors').forEach(function (file) {
    if (file.match(/\.js$/) && file !== 'Errors.js') {
        var name = file.substring(0, file.length - 3);
        var errorType = require(__dirname + '/Errors/' + file);

        Errors[name] = function (key, value) {
            for (var i in errorType) {
                if (errorType.hasOwnProperty(i)) {
                    this[i] = errorType[i];
                }
            }

            this.key = key;
            this.value = value;
        };

        Errors[name].prototype = new Errors();
        Errors[name].prototype.constructor = Errors;
    }
});


module.exports = Errors;
