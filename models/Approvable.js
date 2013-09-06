var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
        return sequelize.define('Approvable', {
    }, LifeSequelize.params({tableName: 'approvables'}));
};