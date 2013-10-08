var StringConstraint = require('./StringConstraint.js'),
    Errors = require('./Errors.js');

/**
 * OAuthToken class for constraints
 *
 * @class OAuthToken
 * @constructor
 */
var OAuthToken = function (key, site_key, required) {
    this.site_key = site_key;
    StringConstraint.call(this, key, required);
};

OAuthToken.prototype = new StringConstraint();
OAuthToken.prototype.constructor = StringConstraint;

OAuthToken.prototype.validate = function (validator, cb) {
    var that = this;

    if (validator.errors.length == 0) {
        var sitename = validator.data[that.site_key];
        sitename = sitename.charAt(0).toUpperCase() + sitename.slice(1).toLowerCase();

        var ThirdParty = require('../LifeThirdParty/' + sitename + '.js');

        var thirdParty = new ThirdParty(validator.context, validator.data[that.key]);

        return thirdParty.getSelf(function (user) {
            if (user === false) {
                validator.errors.push(new Errors.WrongOAuthToken);
            } else {
                validator.output[that.key + '_user'] = user;
            }

            return StringConstraint.prototype.validate.call(that, validator, cb);
        });
    }
};

module.exports = OAuthToken;