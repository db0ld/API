var Abstract = function(context, token) {
    this.context = context;
    this.token = token;
};

Abstract.prototype.getUserId = function (token, cb) {
    return this.context.send.error(new LifeErrors.NotImplemented());
};

Abstract.prototype.getSelf = function (cb) {
    return this.context.send.error(new LifeErrors.NotImplemented());
};

Abstract.prototype.doRequest = function (options, uses_https, cb) {
	var https = require(uses_https ? 'https' : 'http');

    return https.get(options, function(res) {
        if (res.statusCode == 200) {
            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });

            return res.on('end', function(){
                cb(data);
            })
        }

        return cb(false);
    }).on('error', function(e) {
        return cb(false);
    });
};

module.exports = Abstract;