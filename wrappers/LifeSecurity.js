var OAuthToken = require('mongoose').model('OAuthToken');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeErrors = require('../wrappers/LifeErrors.js');

var LifeSecurity = function() {

};

LifeSecurity.roles = {};

LifeSecurity.roles.ROOT = 'ROLE_ROOT';
LifeSecurity.roles.USER_MANAGEMENT = 'ROLE_USER_MANAGEMENT';

LifeSecurity.rolesHierarchy = {};

LifeSecurity.rolesHierarchy[LifeSecurity.roles.ROOT] = [LifeSecurity.roles.USER_MANAGEMENT];

LifeSecurity.hasRole = function(user, role) {
    // TODO
    return true;
};

LifeSecurity.authenticationWrapper = function(req, res, authentication, next, cb) {
    if (req.query.token) {
        OAuthToken.findByToken(new LifeQuery(OAuthToken, req, res, next), req.query.token).execOne(false, function(token) {
            if (typeof authentication === 'object' && authentication instanceof Array) {
                for (var i in authentication) {
                    if (!LifeSecurity.hasRole(token.user, authentication[i]))
                        return next(LifeErrors.AuthenticationMissingRole);
                }
            }

            req.token = token;

            return cb(req, res, next);
        });
    } else {
        if (typeof authentication !== 'undefined') {
            return next(LifeErrors.AuthenticationRequired);
        }

        return cb(req, res, next);
    }
};

module.exports = LifeSecurity;