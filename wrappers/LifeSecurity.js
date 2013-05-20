var OAuthToken = require('mongoose').model('OAuthToken');
var LifeQuery = require('../wrappers/LifeQuery.js');

var LifeSecurity = function() {

};

LifeSecurity.roles = {};

LifeSecurity.roles.ROOT = 'ROLE_ROOT';
LifeSecurity.roles.USER_MANAGEMENT = 'ROLE_USER_MANAGEMENT';

LifeSecurity.rolesHierarchy = {};

LifeSecurity.rolesHierarchy[LifeSecurity.roles.ROOT] = [LifeSecurity.roles.USER_MANAGEMENT];

LifeSecurity.hasRole = function(user, role) {
    return true;
};

LifeSecurity.authenticationWrapper = function(req, res, next, cb) {
    if (req.query.token) {
        OAuthToken.findByToken(new LifeQuery(OAuthToken, req, res, next), req.query.token).execOne(false, function(token) {
            req.token = token;

            return cb(req, res, next);
        });
    } else {
        return cb(req, res, next);
    }
};

module.exports = LifeSecurity;