var User = require('mongoose').model('User'),
    OAuthToken = require('mongoose').model('OAuthToken'),
    LifeQuery = require('./LifeQuery.js'),
    LifeErrors = require('./LifeErrors.js'),
    LifeConfig = require('./LifeConfig.js'),
    LifeResponse = require('./LifeResponse.js');

/**
 * An utility class that performs security checks.
 * Constructors perform authentification if required or if a token
 * is present in request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {*} auth
 * @param {Function} cb
 * @class LifeSecurity
 * @constructor
 */
var LifeSecurity = function (req, res, auth, cb) {
    this.req = req;
    this.res = res;

    var next = function (err) {
        err = err || LifeErrors.AuthenticationError;

        return new LifeResponse(req, res).single(null, err);
    };

    req.security = this;

    var src_user_id = req.body.src_user_id || req.query.src_user_id;

    var callback = src_user_id ? function (req, res, next) {
        if (!LifeSecurity.hasRole(req.user,
                LifeSecurity.roles.ROLE_SUDO)) {
            return next(LifeErrors.AuthenticationMissingRole);
        }

        return new LifeQuery(User, req, res, next)
            .findByLogin(src_user_id)
            .execOne(false, function (user) {
                console.log('>>> '  + req.user.login + ' is now ' + user.login);

                req.user = user;
                return cb(req, res, next);
            });
    } : cb;

    if (req.query.token || req.body.token) {
        var token_str = req.query.token || req.body.token;

        return new LifeQuery(OAuthToken, req, res, next)
            .findByToken(token_str)
            .execOne(true, function (token) {
                var i;

                if (token === null) {
                    return next(LifeErrors.AuthenticationError);
                }

                if (typeof auth === 'object' && auth instanceof Array) {
                    for (i in auth) {
                        if (auth.hasOwnProperty(i) &&
                                !LifeSecurity.hasRole(token.user, auth[i])) {
                            return next(LifeErrors.AuthenticationMissingRole);
                        }
                    }
                }

                req.token = token;
                req.user = token.user;
                req.lang = token.user.lang;

                return callback(req, res, next);
            });
    }

    if (auth !== undefined && auth !== false) {
        return next(LifeErrors.AuthenticationRequired);
    }

    return callback(req, res, next);
};

/**
 * List of application roles
 *
 * @inner
 */
LifeSecurity.roles = {
    ROOT: 'ROLE_ROOT',
    USER_MANAGEMENT: 'ROLE_USER_MANAGEMENT',
    ACHIEVEMENT_MANAGEMENT: 'ROLE_ACHIEVEMENT_MANAGEMENT',
    ROLE_SUDO: 'ROLE_SUDO'
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
LifeSecurity.hasRole = function (user, role) {
    if (!user) {
        return false;
    }

    if (LifeConfig.dev) {
        return true;
    }

    // TODO

    return false;
};

/**
 * Checks if user has a given role
 */
LifeSecurity.prototype.hasRole = function (role) {
    if (!this.req.token) {
        return false;
    }

    return LifeSecurity.hasRole(this.req.user, role);
};

/**
 * Get allowed username for user
 *
 * @param {String} login
 */
LifeSecurity.prototype.getLogin = function (login) {
    return this.getUsername(login);
};

/**
 * Get allowed username for user
 * Badly named method, to replace
 *
 * @param {String} username
 */
LifeSecurity.prototype.getUsername = function (username) {
    if (!this.req.token || !this.req.user ||
            !this.req.user.login) {
        return null;
    }

    var currentUsername = this.req.user.login;

    if (username === 'me' || !username) {
        return currentUsername;
    }

    if (username !== currentUsername) {
        if (this.hasRole(LifeSecurity.roles.USER_MANAGEMENT)) {
            return username;
        }
    }

    return currentUsername;
};

module.exports = LifeSecurity;
