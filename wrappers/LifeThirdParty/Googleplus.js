var Abstract = require('./Abstract.js');

var Googleplus = function(context, token) {
    this.context = context;
    this.token = token;

    Abstract.call(this, context, token);
};

Googleplus.prototype = new Abstract();
Googleplus.prototype.constructor = Abstract;

Googleplus.prototype.getIdFromUser = function (user, cb) {
    return cb(user.id);
};

Googleplus.prototype.getSelf = function (cb) {
    var options = {
        host: 'www.googleapis.com',
        path: '/plus/v1/people/me',
        headers: {
            'Authorization': 'Bearer ' + this.token
        }
    };

    return this.doRequest(options, true, function (data) {
        cb(JSON.parse(data))
    });
};

module.exports = Googleplus;
