var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('News', {
        content: {type: DataTypes.TEXT, allowNull: false}
    }, LifeSequelize.params({tableName: 'news'}));
};
