var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Locale', {
        iso_code: {type: DataTypes.STRING(5), allowNull: false},
        name: {type: DataTypes.STRING(64), allowNull: false},
        locale_name: {type: DataTypes.STRING(64), allowNull: false},
    }, LifeSequelize.params({tableName: 'locales'}));
};
