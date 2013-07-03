var LifeData = require('../wrappers/LifeData.js');

module.exports = function (schema, options) {
    schema.add({
        modification: Date,
        creation: {type: Date, 'default' : Date.now }
    });

    schema.pre('save', function (next) {
        this.modification = new Date();
        next();
    });

    schema.options.toJSON = {
        getters: true,
        virtuals: true
    };
};
