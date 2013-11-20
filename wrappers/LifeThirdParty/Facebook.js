var Abstract = require('./Abstract.js');

var Facebook = function(context, token) {
    this.context = context;
    this.token = token;

    Abstract.call(this, context, token);
};

Facebook.prototype = new Abstract();
Facebook.prototype.constructor = Abstract;

Facebook.prototype.getIdFromUser = function (user, cb) {
    return cb(user.id);
};

Facebook.prototype.getSelf = function (cb) {
    var options = {
        host: 'graph.facebook.com',
        path: '/me?access_token=' + this.token,
    };

    return this.doRequest(options, true, function (data) {
        cb(JSON.parse(data))
    });
};

module.exports = Facebook;