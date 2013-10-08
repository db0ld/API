var LifeErrors = require('./LifeErrors.js'),
    Errors = require('./LifeConstraints/Errors.js');

var LifeValidator = function (context, rules, data) {
    var i;

    this.context = context;
    this.data = data || context.body() || {};
    this.output = {};
    this.rules = rules || context._route._input || [];
    this.errors = [];
    this.validateRules = this.rules.slice();
    this.sanitizeRules = this.rules.slice();
    this.temp = {};
};

LifeValidator.prototype.validate = function (cb) {
    var that = this;

    if (that.validateRules.length === 0) {
        if (that.errors.length) {
            var error = new LifeErrors.ValidationFailed(that.errors);

            return that.context.send.error(error);
        }

        return cb.call(that);
    }

    var rule = that.validateRules.shift();

    return rule.required(function (required) {
        return rule.present(that, function (present) {
            if (present) {
                return rule.validate(that, function () {
                    return that.validate(cb);
                });
            }

            if (required) {
                that.errors.push(new Errors.MissingParameter(rule.key));
            }

            return that.validate(cb);
        });
    });
};

LifeValidator.prototype.sanitize = function (cb) {
    var that = this;

    if (that.sanitizeRules.length === 0) {
        return cb.call(that, that.output);
    }

    var rule = that.sanitizeRules.shift();

    return rule.present(that, function (present) {
        if (present) {
            return rule.sanitize(that, function () {
                return that.sanitize(cb);
            });
        }

        return that.sanitize(cb);
    });
};

module.exports = LifeValidator;