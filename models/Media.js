var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Media', {
        path: {type: DataTypes.STRING(255), allowNull: false},
        type: {type: DataTypes.STRING(32), allowNull: false},
        x: {type: DataTypes.INTEGER},
        y: {type: DataTypes.INTEGER},
        length: {type: DataTypes.INTEGER},
    }, LifeSequelize.params({tableName: 'medias'}));
};
