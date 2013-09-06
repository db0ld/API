var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('User', {
        login: {
            type: DataTypes.STRING(32),
            unique: true,
            allowNull: false,
            set: function(login) {
                this.login = login.toLowerCase();
            }
        },
        firstname: {type: DataTypes.STRING(64), allowNull: false},
        lastname: {type: DataTypes.STRING(64), allowNull: false},
        gender: {type: DataTypes.STRING(16), allowNull: false},
        birthday: {type: DataTypes.DATE, allowNull: false},
        email: {type: DataTypes.STRING(255), allowNull: false},
        score: {type: DataTypes.INTEGER.UNSIGNED}
    }, LifeSequelize.params({tableName: 'users'}));
};
