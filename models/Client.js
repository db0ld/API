var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Client', {
        ip: {type: DataTypes.STRING(39), allowNull: false},
        token: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true,
            set: function(login) {
                this.login = login.toLowerCase();
            }
        },
        expiration: {type: DataTypes.DATE, allowNull: false},
        oauth_provider: {type: DataTypes.STRING(32), allowNull: false},
        oauth_token: {type: DataTypes.STRING(128), allowNull: false},
    }, LifeSequelize.params({tableName: 'clients'}));
};
