var fs = require('fs'),
    LifeSecurity = require('./LifeSecurity.js'),
    LifeResponse = require('./LifeResponse.js'),
    LifeConfig = require('./LifeConfig.js'),
    LifeErrors = require('./LifeErrors.js'),
    LifeValidator = require('./LifeValidator.js');

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

/**
 * Route sorting function (path + http method)
 *
 * @param {Object} a
 * @param {Object} b
 * @function
 */
var routesSort = function (a, b) {
    if (a.route === b.route) {
        return a.method < b.method ? -1 : 1;
    }

    return a.route < b.route ? -1 : 1;
};

/**
 * Init routing
 *
 * - Calls every js files in controllers directory
 * - Register an Options route
 * - Register a route for documentation
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
            doc: that.documentation
        });
    });
};

/**
 * Create a new API Method listener
 *
 * @param {LifeRouter} router
 * @param {String} method HTTP Method
 * @param {String} doc Documentation for current API method
 * @class LifeRouter.Method
 * @constructor
 */
LifeRouter.Method = function (router, method, doc) {
    this._router = router;
    this._method = method.toLowerCase();

    this._doc = doc;
    this._input = [];
    this._output = null;
    this._errors = [];
    this._routes = [];
    this._auth = false;
    this._list = false;
};

/**
 * Register a new route for current API Method
 *
 * @param {String} route
 * @param {Boolean} [priv=true] Is current route private?
 * @method
 */
LifeRouter.Method.prototype.route = function (route, priv) {
    priv = priv === undefined ? true : priv;

    this._routes.push({
        route: route,
        priv: priv
    });

    return this;
};

/**
 * Register a list return type
 *
 * @param {*} output Output type
 * @method
 */
LifeRouter.Method.prototype.list = function (output) {
    this._list = true;

    if (output !== undefined) {
        this._output = output;
    }

    return this;
};

/**
 * Register authentication requirements for current route
 *
 * - If auth is Boolean : whenever the user should be logged or not
 * - String/String Array : Roles requirements
 *
 * @param {*} auth Requirements
 * @method
 */
LifeRouter.Method.prototype.auth = function (auth) {
    if (typeof auth !== 'boolean') {
        auth = [auth];
    }

    this._auth = auth;

    return this;
};

/**
 * Input format for POST and PUT methods.
 *
 * This format will be validated on request
 *
 * @param {object} input
 * @method
 */
LifeRouter.Method.prototype.input = function (input) {
    this._input = input;

    return this;
};

/**
 * Register an error that can be returned by API.
 *
 * @param {LifeError} error
 * @method
 */
LifeRouter.Method.prototype.error = function (error) {
    this._errors.push(error);

    return this;
};

/**
 * Register the output format for this API method
 *
 * @param {*} output
 * @method
 */
LifeRouter.Method.prototype.output = function (output) {
    this._output = output;

    return this;
};

/**
 * Register current API method with its callback function.
 *
 * Performs the following tasks
 * - Input sanitization
 * - Language detection
 * - Authentication
 * - Debug output on dev mode
 * - Register documentation
 *
 * @param {Function} cb
 * @method
 */
LifeRouter.Method.prototype.add = function (cb) {
    var that = this;

    // Input sanitization
    var cbSanitize = function (req, res, next) {
        return new LifeValidator(that._input, req, next).validate(function () {
            return this.sanitize(function (input) {
                return cb(req, res, next, input);
            });
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

        return cbSanitize(req, res, next);
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

/**
 * Create a new HTTP GET LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Get = function (doc) {
    return new LifeRouter.Method(this, 'get', doc);
};

/**
 * Create a new HTTP POST LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Post = function (doc) {
    return new LifeRouter.Method(this, 'post', doc);
};

/**
 * Create a new HTTP PUT LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Put = function (doc) {
    return new LifeRouter.Method(this, 'put', doc);
};

/**
 * Create a new HTTP DELETE LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Delete = function (doc) {
    return new LifeRouter.Method(this, 'delete', doc);
};

/**
 * Create a new HTTP PATCH LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Patch = function (doc) {
    return new LifeRouter.Method(this, 'patch', doc);
};

/**
 * Create a new HTTP HEAD LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Head = function (doc) {
    return new LifeRouter.Method(this, 'head', doc);
};

/**
 * Create a new HTTP OPTIONS LifeRouter.Method Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Options = function (doc) {
    return new LifeRouter.Method(this, 'options', doc);
};

module.exports = LifeRouter;
