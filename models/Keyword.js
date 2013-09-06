var LifeSequelize = require('../wrappers/LifeSequelize.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Keyword', {
    }, LifeSequelize.params({tableName: 'keywords'}));
};
