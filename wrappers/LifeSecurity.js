/**
 * An utility class that performs security checks.
 * Constructors perform authentification if required or if a token
 * is present in request
 *
 * @param {LifeContext} context
 * @class LifeSecurity
 * @constructor
 */
var LifeSecurity = function (context) {
    this.context = context;
};

/**
 * If a token is provided in request authenticate user
 */
LifeSecurity.prototype.authenticate = function (cb) {
    return cb(false);
};

/**
 * If user can log as another, switch user
 */
LifeSecurity.prototype.sudo = function (cb) {
    return cb(false);
};

/**
 * Checks if user has a given role
 *
 * @param {String} role
 */
LifeSecurity.prototype.hasRole = function (role, cb) {
    return cb(false);
};

/**
 * Checks if user has an access right for a given object
 *
 * @param {String} action
 */
LifeSecurity.prototype.hasAcl = function (object, action, cb) {
    return cb(false);
};

module.exports = LifeSecurity;
