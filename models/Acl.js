var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Acl', {
        operation: {type: DataTypes.STRING(32), allowNull: false}
    }, LifeSequelize.params({tableName: 'acls'}));
};