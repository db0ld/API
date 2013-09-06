var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Approval', {
        approval: {type: DataTypes.BOOLEAN}
    }, LifeSequelize.params({tableName: 'approvals'}));
};
