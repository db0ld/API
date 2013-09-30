var LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    mongoose = require('mongoose'),
    Client = mongoose.model('Client');



/**
 * An utility class that performs security checks.
 * Constructors perform authentification if required or if a token
 * is present in request
 *
 * @param {LifeContext} context
 * @class LifeSecurity
 * @constructor
 */
var LifeSecurity = function (context) {
    this.context = context;
    this.client = null;
    this.user = null;
};

/**
 * If a token is provided in request authenticate user
 */
LifeSecurity.prototype.authenticate = function (cb) {
    var that = this;
    var token = this.context.query('token') || this.context.body('token');

    if (!token) {
        return cb(false);
    }

    return new LifeQuery(Client, this.context)
        .tokenAndDate(token)
        .execOne(true, function (client) {
            if (!client) {
                return that.context.send.error(new LifeErrors.AuthenticationError());
            }

            that.user = client.user;
            that.client = client;

            return cb(false);
        });
};

/**
 * If user can log as another, switch user
 */
LifeSecurity.prototype.sudo = function (cb) {
    return cb(false);
};

/**
 * Checks if user has a given role
 *
 * @param {String} role
 */
LifeSecurity.prototype.hasRole = function (role, cb) {
    return cb(false);
};

/**
 * Checks if user has an access right for a given object
 *
 * @param {String} action
 */
LifeSecurity.prototype.hasAcl = function (object, action, cb) {
    return cb(false);
};

module.exports = LifeSecurity;
