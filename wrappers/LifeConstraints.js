var fs = require('fs'),
    LifeConstraints = {};

/*
 * Generic classic constraints
 */

fs.readdirSync(__dirname + '/LifeConstraints').forEach(function (file) {
    if (file.match(/\.js$/) && file !== 'Errors.js') {
        var name = file.substring(0, file.length - 3);

        if (name.match(/Constraint$/)) {
            name = file.substring(0, name.length - 10);
        }

        LifeConstraints[name] = require(__dirname + '/LifeConstraints/' + file);
    }
});

/*
 * Our custom constraints
 */

LifeConstraints.AchivementStateEnum = LifeConstraints.Enum.bind(null, ['not_planned', 'planned', 'in_progress', 'done']);

LifeConstraints.GenderEnum = LifeConstraints.Enum.bind(null, ['male', 'female', 'other', 'undefined']);

LifeConstraints.LoginRegexp = LifeConstraints.RegExp.bind(null, /^[a-zA-Z0-9\-_]{3,20}$/);

module.exports = LifeConstraints;