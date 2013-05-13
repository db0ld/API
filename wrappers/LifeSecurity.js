var LifeSecurity = function() {

};

LifeSecurity.authenticationWrapper = function(req, res, next, cb) {
    req.token = {
        'user': {
            'Moi': 'lol'
        }
    };

    return cb(req, res, next);
};

module.exports = LifeSecurity;