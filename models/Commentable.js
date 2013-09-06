var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Commentable', {
    }, LifeSequelize.params({tableName: 'commentables'}));
};