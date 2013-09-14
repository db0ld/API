var fs = require('fs'),
    LifeConstraints = {};

/*
 * Generic classic constraints
 */

fs.readdirSync(__dirname + '/LifeConstraints').forEach(function (file) {
    if (file.substring(0, 1) !== '_' && file.match(/\.js$/) &&
        file !== 'Errors.js') {
        var name = file.substring(0, file.length - 3);

        if (name.match(/Constraint$/)) {
            name = file.substring(0, name.length - 10);
        }

        LifeConstraints[name] = require(__dirname + '/LifeConstraints/' + file);
    }
});

module.exports = LifeConstraints;