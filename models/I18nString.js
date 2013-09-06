var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('I18nString', {
        string: {type: DataTypes.STRING(255), allowNull: false}
    }, LifeSequelize.params({tableName: 'i18n_strings'}));
};