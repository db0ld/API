var OAuthToken = require('mongoose').model('OAuthToken');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeConfig = require('./LifeConfig.js');

/**
 * An utility class that performs security checks.
 *
 * @class LifeSecurity
 * @constructor
 */
var LifeSecurity = function() {

};

/**
 * List of application roles
 *
 * @inner
 */
LifeSecurity.roles = {
    ROOT: 'ROLE_ROOT',
    USER_MANAGEMENT: 'ROLE_USER_MANAGEMENT',
    ACHIEVEMENT_MANAGEMENT: 'ROLE_ACHIEVEMENT_MANAGEMENT'
};

/**
 * Hierarchy of application roles
 *
 * @inner
 */
LifeSecurity.rolesHierarchy = {};
LifeSecurity.rolesHierarchy[LifeSecurity.roles.ROOT] = [
    LifeSecurity.roles.USER_MANAGEMENT,
    LifeSecurity.roles.ACHIEVEMENT_MANAGEMENT
];

/**
 * Check if user has a given role
 *
 * @param {Object} user
 * @param {String} role
 * @static
 */
LifeSecurity.hasRole = function(user, role) {
    if (!user) {
        return false;
    }

    if (LifeConfig['dev']) {
        return true;
    }

    // TODO

    return true;
};

/**
 * Perform authentification if required or if a token is present in request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {*} auth
 * @param {Function} next
 * @param {Function} cb
 */
LifeSecurity.authWrapper = function(req, res, auth, next, cb) {
    if (req.query.token || req.body.token) {
        var token_str = req.query.token || req.body.token;

        OAuthToken
            .findByToken(new LifeQuery(OAuthToken, req, res, next), token_str)
            .execOne(false, function(token) {
                if (typeof auth === 'object' &&
                    auth instanceof Array) {
                    for (var i in auth) {
                        if (!LifeSecurity.hasRole(token.user, auth[i]))
                            return next(LifeErrors.AuthenticationMissingRole);
                    }
                }

            req.token = token;
            req.lang = token.user.lang;

            return cb(req, res, next);
        });
    } else {
        if (typeof auth !== 'undefined') {
            return next(LifeErrors.AuthenticationRequired);
        }

        return cb(req, res, next);
    }
};

module.exports = LifeSecurity;