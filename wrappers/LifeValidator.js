var LifeValidator = function (rules, req, next, data) {
    var i;

    this.req = req;
    this.files = req.files || {};
    this.data = data || req.body || {};
    this.output = {};
    this.rules = rules;
    this.next = next;
    this.errors = [];
    this.validateRules = rules.slice();
    this.sanitizeRules = rules.slice();
    this.temp = {};
};

LifeValidator.prototype.validate = function (cb) {
    var that = this;

    if (that.validateRules.length === 0) {
        if (that.errors.length) {
            return that.next(this.errors); // TODO
        }

        return cb.call(that);
    }

    var rule = that.validateRules.pop();

    return rule.required(function (required) {
        return rule.present(that, function (present) {
            if (present) {
                return rule.validate(that, function () {
                    return that.validate(cb);
                });
            }

            if (required) {
                that.errors.push({});
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

    var rule = that.sanitizeRules.pop();

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