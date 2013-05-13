var User = require('mongoose').model('User');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function(app) {
    var routeBase = 'users';

    // add a single user
    app.post(routeBase, function (req, res, next) {
        return new LifeData(User, req, res).saveFromRequest(next);
    });

    // get a single user
    app.get(routeBase + "/:login", function (req, res, next) {
        console.log(req.route);

        return User.findByLogin(req.params.login, req, res, next).execOne();
    });

    // update a single user
    app.put(routeBase + "/:login", function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(function(user) {
            if (!user) {
                return LifeResponse.send(req, res, null, LifeErrors.UserNotFound);
            }

            return new LifeData(User, req, res).save(LifeData.requestToObject(req, User, user), next);
        });
    });

    // get all users
    app.get(routeBase, function (req, res, next) {
        return LifeQuery.fromModel(User, req, res)
            .paginate()
            .filterRegexp('name', new RegExp(req.query.name, 'i'), typeof req.query.name !== "undefined")
            .exec(function(data, count) {
                return LifeResponse.sendList(req, res, data, count);
            });
    });

    // get a single user by its oauth credentials
    app.get(routeBase + '/ext_oauth', function (req, res, next) {
        User.findByExtOAuth(req.query.provider, req.query.ext_id).execOne();
    });

    // add an oauth token to an user
    app.post(routeBase + '/:login/ext_oauth', function (req, res, next) {
        // Check if this token currently exists
        return User.findByExtOAuth(req.body.provider, req.body.ext_id).execOne(function(user) {
            if (user) {
                return LifeResponse.send(req, res, null, LifeErrors.UserExtTokenAlreadyRegistered);
            }

            return User.findByLogin(req.params.login, req, res, next).execOne(function(user) {
                if (!user) {
                    return LifeResponse.send(req, res, null, LifeErrors.UserNotFound);
                }

                var identity = new models.OAuthIdentity(LifeQuery.requestToObject(req, models.OAuthIdentity));
                user.ext_oauth_identities.push(identity);

                return new LifeData(User, req, res).save(item);
            });
        });
    });
};