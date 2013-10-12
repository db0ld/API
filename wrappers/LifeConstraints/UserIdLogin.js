var Abstract = require('./Abstract.js'),
    LifeQuery = require('../LifeQuery.js'),
    LifeErrors = require('../LifeErrors.js'),
    LifeData = require('../LifeData.js'),
    Errors = require('./Errors.js'),
    mongoose = require('mongoose');

/**
 * UserIdLogin. class for constraints
 *
 * @class UserIdLogin.
 * @constructor
 */
var UserIdLogin = function (key, required, allow_self, throw_404) {
    this.throw_404 = throw_404;
    this.allow_self = allow_self;

    Abstract.call(this, key, required);
};

UserIdLogin.prototype = new Abstract();
UserIdLogin.prototype.constructor = Abstract;

UserIdLogin.prototype.doc = function () {
    return 'User Id or Login';
};

/**
 * Validation for current constraint
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
UserIdLogin.prototype.validate = function (validator, cb) {
    var User = mongoose.model('User')
    var that = this;
    var id = validator.context.params(that.key);

    if (validator.context.user() && that.allow_self &&
        (!id || id == 'self')) {
        id = validator.context.user().id;
    }

    return new LifeQuery(User, validator.context)
        .idOrLogin(id)
        .execOne(true, function (user) {
            if (!user) {
                if (that.throw_404) {
                    return validator.context.send.error(new LifeErrors.NotFound())
                }

                validator.errors.push(new Errors.NotFound(that.key, validator.data[that.key]));
            } else {
                validator.temp['mongooseobj-' + that.key] = user;
            }

            return Abstract.prototype.validate.call(that, validator, cb);
        });
};

/**
 * Value sanitization (trim, int cast and so on)
 *
 * @param {*} data
 * @param {Function} cb
 * @callback
 * @method
 */
UserIdLogin.prototype.sanitize = function (validator, cb) {
    var that = this;

    if (validator.temp['mongooseobj-' + this.key] === undefined) {
        this.validate(validator, function () {
            validator.output[that.key] = validator.temp['mongooseobj-' + that.key];
        });
    }

    validator.output[this.key] = validator.temp['mongooseobj-' + this.key];

    return cb();
};

module.exports = UserIdLogin;