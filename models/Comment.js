var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Comment', {
        message: {type: DataTypes.TEXT, allowNull: false}
    }, LifeSequelize.params({tableName: 'comments'}));
};
