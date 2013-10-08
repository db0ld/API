var https = require('https');

var Facebook = function(context, token) {
    this.context = context;
    this.token = token;
};

Facebook.prototype.getIdFromUser = function (user, cb) {
    return cb(user.id);
};

Facebook.prototype.getSelf = function (cb) {
    var options = {
        host: 'graph.facebook.com',
        path: '/me?access_token=' + this.token,
        port: 443
    };

    return https.get(options, function(res) {
        if (res.statusCode == 200) {
            var data = "";

            res.on('data', function (chunk) {
                data += chunk;
            });

            return res.on('end', function(){
                var user = JSON.parse(data);

                cb(user);
            })
        }

        return cb(false);
    }).on('error', function(e) {
        return cb(false);
    });
};


module.exports = Facebook;