var OAuthToken = require('mongoose').model('OAuthToken');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeConfig = require('./LifeConfig.js');

/**
 * An utility class that performs security checks.
 * Constructors perform authentification if required or if a token is present in request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {*} auth
 * @param {Function} next
 * @param {Function} cb
 * @class LifeSecurity
 * @constructor
 */
var LifeSecurity = function(req, res, auth, next, cb) {
    this.req = req;
    this.res = res;
    this.next = next;
    req.security = this;

    if (req.query.token || req.body.token) {
        var token_str = req.query.token || req.body.token;

        OAuthToken
            .findByToken(new LifeQuery(OAuthToken, req, res, next), token_str)
            .execOne(true, function(token) {
		if (token === null) {
		    return next(LifeErrors.AuthenticationError);
		}

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

    return false;
};

/**
 * Checks if user has a given role
 */
LifeSecurity.prototype.hasRole = function(role) {
    if (!this.req.token) {
	return false;
    }

    return LifeSecurity.hasRole(this.req.token.user, role);
};

/**
 * Get allowed username for user
 *
 * @param {String} login
 */
LifeSecurity.prototype.getLogin = function(login) {
    return this.getUsername(login);
}

/**
 * Get allowed username for user
 * Badly named method, to replace
 *
 * @param {String} username
 */
LifeSecurity.prototype.getUsername = function(username) {
    if (!this.req.token || !this.req.token.user ||
	!this.req.token.user.login) {
	return null;
    }

    var currentUsername = this.req.token.user.login;

    if (username == 'me' || !username) {
	console.log(currentUsername);
	return currentUsername;
    }

    if (username != currentUsername) {
	if (this.hasRole(LifeSecurity.roles.USER_MANAGEMENT)) {
	    console.log(username);
	    return username;
	}
    }

    console.log(currentUsername);
    return currentUsername;
};

module.exports = LifeSecurity;
