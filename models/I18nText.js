var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('I18nText', {
        string: {type: DataTypes.TEXT, allowNull: false}
    }, LifeSequelize.params({tableName: 'i18n_texts'}));
};