var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Application', {
        name: {type: DataTypes.STRING(64), allowNull: false},
        app_id: {type: DataTypes.STRING(64), allowNull: false},
        app_secret: {type: DataTypes.STRING(128), allowNull: false}
    }, LifeSequelize.params({tableName: 'applications'}));
};
