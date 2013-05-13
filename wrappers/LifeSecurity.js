var User = require('mongoose').model('User');

var LifeSecurity = function() {

};

LifeSecurity.authenticationWrapper = function(req, res, next, cb) {
    if (req.query.token) {
        User.findByOauthToken(req.query.token, req, res, next).execOne(function(user) {
            req.token = {
                user: user
            };

            return cb(req, res, next);
        });
    } else {
        return cb(req, res, next);
    }
};

module.exports = LifeSecurity;