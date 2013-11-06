var LifeSecurity = require('./LifeSecurity.js'),
    LifeQuery = require('./LifeQuery.js'),
    LifeErrors = require('./LifeErrors.js'),
    LifeHttpResponse = require('./LifeHttpResponse.js'),
    mongoose = require('mongoose'),
    Application = mongoose.model('Application');

var LifeContext = function (req, res, route) {
    this._req = req || {};
    this._res = res || {};
    this._route = route || {};
    this.security = new LifeSecurity(this);
    this.send = new LifeHttpResponse(this);
    this.locale = null;
    this.application = null;
};

LifeContext.prototype.requestAttribute = function (set, key, defaultValue) {
    if (key === undefined && typeof set === "string") {
        return this._req[set];
    }

    if (defaultValue === undefined) {
        defaultValue = null;
    }

    if (set === null) {
        set = ['query', 'body', 'params'];
    } else if (!(set instanceof Array)) {
        set = [set];
    }

    for (var i = 0; i < set.length; i++) {
        if (this._req[set[i]][key] !== undefined &&
            this._req[set[i]][key] !== null) {
            return this._req[set[i]][key];
        }
    }

    return defaultValue;
};

LifeContext.prototype.hasRolesForRoute = function (cb) {
    if (this._route._auth !== false && !this.user()) {
        return this.send.error(new LifeErrors.AuthenticationRequired());
    }

    // TODO Check roles

    return cb(true);
};

LifeContext.prototype.detectLanguage = function (cb) {
    this.locale = 'en-US';

    return cb(true);
};

LifeContext.prototype.detectApplication = function (cb) {
    var that = this;

    var ua = that.headers('user-agent', false);
    ua = 'Life_Website 1.0'; // TODO remove this line

    if (ua) {
        ua = ua.split(' ')[0];

        return new LifeQuery(Application, this)
            .userAgent(ua)
            .execOne(true, function (application) {
                that.application = application;

                return cb(true);
            });
    }

    return cb(true);
};

LifeContext.prototype.query = function (key, defaultValue) {
    if (key === undefined) {
        return this._req.query;
    }

    return this.requestAttribute('query', key, defaultValue);
};

LifeContext.prototype.body = function (key, defaultValue) {
    if (key === undefined) {
        return this._req.body;
    }

    return this.requestAttribute('body', key, defaultValue);
};

LifeContext.prototype.params = function (key, defaultValue) {
    if (key === undefined) {
        return this._req.params;
    }

    return this.requestAttribute('params', key, defaultValue);
};

LifeContext.prototype.connection = function (key, defaultValue) {
    if (key === undefined) {
        return this._req.connection;
    }

    return this.requestAttribute('connection', key, defaultValue);
};

LifeContext.prototype.files = function (key) {
    if (key === undefined) {
        return this._req.files;
    }

    return this.requestAttribute('files', key);
};

LifeContext.prototype.headers = function (key, defaultValue) {
    if (key === undefined) {
        return this._req.headers;
    }

    return this.requestAttribute('headers', key, defaultValue);

};

LifeContext.prototype.user = function () {
    return this.security.user;
};

LifeContext.prototype.route = function () {
    return this._route;
};

LifeContext.prototype.token = function () {
    return this.security.token;
};

LifeContext.prototype.filters = function () {
    return this._route._filters;
}

module.exports = LifeContext;