var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('AchievementStatus', {
        status: {type: DataTypes.STRING(64), allowNull: false},
        message: {type: DataTypes.TEXT, allowNull: false}
    }, LifeSequelize.params({tableName: 'achievement_statuses'}));
};