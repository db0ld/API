var fs = require('fs'),
    LifeConfig = require('./LifeConfig.js'),
    LifeErrors = require('./LifeErrors.js'),
    LifeContext = require('./LifeContext.js'),
    LifeValidator = require('./LifeValidator.js');


var dumpContext = function (context, cb) {
    console.log(new Array(80).join('-').toString());
    console.log(new Date().toISOString());
    console.log(context._req.method + ': ' + context._req.url);
    if (context.body() && Object.keys(context.body()).length) {
        console.log('PARAMS POST: ' + JSON.stringify(context.body(), null, 4));
    }

    return cb(true);
};

/**
 * An utility class that routes requests on top of ExpressJS.
 *
 * @class LifeRouter
 * @constructor
 */
var LifeRouter = function (app) {
    this.app = app;

    this.documentation = [];
    this.precontroller = [
        {
            fun: function (context, cb) {
                return dumpContext(context, cb);
            },
            priority: 100
        },
        {
            fun: function (context, cb) {
                context.security.authenticate(cb);
            },
            priority: 90
        },
        {
            fun: function (context, cb) {
                context.security.sudo(cb);
            },
            priority: 85
        },
        {
            fun: function (context, cb) {
                context.hasRolesForRoute(cb);
            },
            priority: 80
        },
        {
            fun: function (context, cb) {
                context.detectLanguage(cb);
            },
            priority: 75
        },
        {
            fun: function (context, cb) {
                context.detectApplication(cb);
            },
            priority: 72
        },
        {
            fun: function (context, cb) {
                return new LifeValidator(context, context._route._params, context._req.params).validate(function (ok) {
                    return this.sanitize(function (input) {
                        context._req.params = input;

                        return cb(true);
                    });
                });
            },
            priority: 70
        },
        {
            fun: function (context, cb) {
                return new LifeValidator(context).validate(function (ok) {
                    return this.sanitize(function (input) {
                        context.input = input;

                        return cb(true);
                    });
                });
            },
            priority: 65
        },
    ];
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
};

/**
 * Create a new API Route listener
 *
 * @param {LifeRouter} router
 * @param {String} method HTTP Route
 * @param {String} doc Documentation for current API method
 * @class LifeRouter.Route
 * @constructor
 */
LifeRouter.Route = function (router, method, doc) {
    this._router = router;
    this._method = method.toLowerCase();

    this._doc = doc;
    this._input = [];
    this._output = null;
    this._errors = [];
    this._routes = [];
    this._params = [];
    this._auth = false;
    this._list = false;
    this._filters = [];
    this._precontroller = router.precontroller.slice();
};

/**
 * Register a new route for current API Route
 *
 * @param {String} route
 * @param {Boolean} [priv=true] Is current route private?
 * @method
 */
LifeRouter.Route.prototype.route = function (route, priv) {
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
LifeRouter.Route.prototype.list = function (output) {
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
LifeRouter.Route.prototype.auth = function (auth) {
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
LifeRouter.Route.prototype.input = function (input) {
    this._input = input;

    return this;
};

/**
 * Input format for URL parameters.
 *
 * This format will be validated on request
 *
 * @param {object} input
 * @method
 */
LifeRouter.Route.prototype.params = function (params) {
    this._params = params;

    return this;
};

/**
 * Input format for GET filters.
 *
 * @param {object} input
 * @method
 */
LifeRouter.Route.prototype.filters = function (filters) {
    this._filters = filters;

    return this;
};

/**
 * Register an error that can be returned by API.
 *
 * @param {LifeError} error
 * @method
 */
LifeRouter.Route.prototype.error = function (error) {
    this._errors.push(error);

    return this;
};

/**
 * Register the output format for this API method
 *
 * @param {*} output
 * @method
 */
LifeRouter.Route.prototype.output = function (output) {
    this._output = output;

    return this;
};

var expressToLife = function (context, precontroller, cb) {
    if (precontroller.length === 0) {
        return cb(context);
    }

    var currMethod = precontroller.shift();

    return currMethod.fun(context, function (ret) {
        if (ret instanceof LifeErrors) {
            return context.error(ret);
        }

        return expressToLife(context, precontroller, cb);
    });
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
LifeRouter.Route.prototype.add = function (cb) {
    var that = this;

    var cbExpressToLife = function (req, res) {
        var context = new LifeContext(req, res, that);

        return expressToLife(context, that._precontroller.slice(), cb);
    };

    that._routes.forEach(function (route) {
        var priv = route.priv;
        route = LifeRouter.makePath(route.route);

        var module = route.split('/').splice(0, 4).join('/');
        that._router.app[that._method](route, cbExpressToLife);

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
            'list': that._list,
            'params': that._params
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
 * Create a new HTTP GET LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Get = function (doc) {
    return new LifeRouter.Route(this, 'get', doc);
};

/**
 * Create a new HTTP POST LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Post = function (doc) {
    return new LifeRouter.Route(this, 'post', doc);
};

/**
 * Create a new HTTP PUT LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Put = function (doc) {
    return new LifeRouter.Route(this, 'put', doc);
};

/**
 * Create a new HTTP DELETE LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Delete = function (doc) {
    return new LifeRouter.Route(this, 'delete', doc);
};

/**
 * Create a new HTTP PATCH LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Patch = function (doc) {
    return new LifeRouter.Route(this, 'patch', doc);
};

/**
 * Create a new HTTP HEAD LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Head = function (doc) {
    return new LifeRouter.Route(this, 'head', doc);
};

/**
 * Create a new HTTP OPTIONS LifeRouter.Route Object
 *
 * @param {String} doc
 * @function
 */
LifeRouter.prototype.Options = function (doc) {
    return new LifeRouter.Route(this, 'options', doc);
};

module.exports = LifeRouter;
