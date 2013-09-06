var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Achievement', {
        secret: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        discoverable: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
    }, LifeSequelize.params({tableName: 'achievements'}));
};