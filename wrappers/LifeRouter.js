var fs = require('fs'),
    mongoose = require('mongoose'),
    LifeSecurity = require('./LifeSecurity.js'),
    LifeResponse = require('./LifeResponse.js'),
    LifeConfig = require('./LifeConfig.js'),
    LifeErrors = require('./LifeErrors.js'),
    LifeConstraint = require('./LifeConstraint.js'),
    LifeValidation = require('./LifeValidation.js'),
    LifeUpload = require('./LifeUpload.js');

/**
 * An utility class that routes requests on top of ExpressJS.
 *
 * @class LifeRouter
 * @constructor
 */
var LifeRouter = function (app) {
    this.app = app;

    this.documentation = [];
};

var routesSort = function (a, b) {
    if (a.route === b.route) {
        return a.method < b.method ? -1 : 1;
    }

    return a.route < b.route ? -1 : 1;
};

/**
 * Init routing
 *
 * @method
 */
LifeRouter.prototype.init = function () {
    var that = this;

    // blocking readdir, never mind, only launched at app initialization
    fs.readdirSync('./controllers').forEach(function (file) {
        if (file.match(/\.js$/)) {
            require('../controllers/' + file)(that);
        }
    });

    this.app.options('*', function (req, res, next) {
        return new LifeResponse(req, res).single();
    });

    this.app.get('/doc/v1', function (req, res) {
        var i;

        for (i in that.documentation) {
            if (that.documentation.hasOwnProperty(i)) {
                that.documentation[i].sort(routesSort);
            }
        }

        return res.render('doc.ejs', {
            doc: that.documentation,
            mongoose: mongoose,
            LifeUpload: LifeUpload,
            ExtRegExp: LifeConstraint.ExtRegExp
        });
    });
};

LifeRouter.Method = function (router, method, doc) {
    this._router = router;
    this._method = method;

    this._doc = doc;
    this._input = null;
    this._output = null;
    this._errors = [];
    this._routes = [];
    this._auth = false;
    this._list = false;
};

LifeRouter.Method.prototype.route = function (route, priv) {
    priv = priv === undefined ? true : priv;

    this._routes.push({
        route: route,
        priv: priv
    });

    return this;
};

LifeRouter.Method.prototype.list = function (output) {
    this._list = true;

    if (output !== undefined) {
        this._output = output;
    }

    return this;
};

LifeRouter.Method.prototype.auth = function (auth) {
    if (typeof auth !== 'boolean') {
        auth = [auth];
    }

    this._auth = auth;

    return this;
};

LifeRouter.Method.prototype.input = function (input) {
    this._input = input;

    return this;
};

LifeRouter.Method.prototype.error = function (error) {
    this._errors.push(error);

    return this;
};

LifeRouter.Method.prototype.output = function (output) {
    this._output = output;

    return this;
};

LifeRouter.Method.prototype.add = function (cb) {
    var that = this;

    // Input sanitization
    var cb1 = function (req, res, next) {
        new LifeValidation(null, req, res, next).whitelist(that._input, null,
            function (input) {
                return cb(req, res, next, input);
            });
    };

    // Language detection
    var cb2 = function (req, res, next) {
        if (req.query.lang !== undefined) {
            req.lang = req.query.lang;
        } else if (req.body.lang !== undefined) {
            req.lang = req.body.lang;
        }

        req.query.lang = req.lang;
        req.body.lang = req.lang;

        return cb1(req, res, next);
    };

    // Auth
    var cb3 = function (req, res) {
        return new LifeSecurity(req, res, that._auth, cb2);
    };

    // Debug
    var cb4 = function (req, res) {
        if (LifeConfig.dev) {
            console.log(new Array(80).join('-').toString());
            console.log(new Date().toISOString());
            console.log(that._method + ': ' + req.url);
            if (req.body && Object.keys(req.body).length) {
                console.log('PARAMS POST: ' +
                    JSON.stringify(req.body, null, 4));
            }
        }

        return cb3(req, res);
    };

    that._routes.forEach(function (route) {
        var priv = route.priv;
        route = LifeRouter.makePath(route.route);

        var module = route.split('/').splice(0, 4).join('/');
        that._router.app[that._method](route, cb4);

        if (that._router.documentation[module] === undefined) {
            that._router.documentation[module] = [];
        }

        that._router.documentation[module].push({
            'doc': that._doc,
            'route': route,
            'private': priv,
            'auth': that._auth,
            'input': that._input,
            'output': that._output,
            'errors': that._errors,
            'method': that._method,
            'list': that._list
        });
    });

    return that._router;
};

/**
 * Create an API path, with current version and prefix
 *
 * @param {String} res
 * @function
 */
LifeRouter.makePath = function (res) {
    return LifeConfig.api_path + 'v' + LifeConfig.version + '/' + res;
};


LifeRouter.prototype.Get = function (doc) {
    return new LifeRouter.Method(this, 'get', doc);
};

LifeRouter.prototype.Post = function (doc) {
    return new LifeRouter.Method(this, 'post', doc);
};

LifeRouter.prototype.Put = function (doc) {
    return new LifeRouter.Method(this, 'put', doc);
};

LifeRouter.prototype.Delete = function (doc) {
    return new LifeRouter.Method(this, 'delete', doc);
};

LifeRouter.prototype.Patch = function (doc) {
    return new LifeRouter.Method(this, 'patch', doc);
};

LifeRouter.prototype.Head = function (doc) {
    return new LifeRouter.Method(this, 'head', doc);
};

LifeRouter.prototype.Options = function (doc) {
    return new LifeRouter.Method(this, 'options', doc);
};

module.exports = LifeRouter;
