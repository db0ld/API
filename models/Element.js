module.exports = exports = function (schema, options) {
    schema.add({
        modification: Date,
        creation: {type: Date, 'default' : Date.now }
    });

  schema.pre('save', function (next) {
    this.modification = new Date();
    next();
  });
};
