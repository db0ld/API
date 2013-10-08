var BinaryLogic = require('./BinaryLogic.js');

module.exports = BinaryLogic.bind(null, function (constraints, count) {
    return count > 0;
}, "OR");