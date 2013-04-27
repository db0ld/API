var api_utils = require('../utils/api.js');
var error_codes = require('../utils/error_codes.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeCommonRoutes = require('../wrappers/LifeCommonRoutes.js');

module.exports = function(app, models) {
    var routeBase = __filename.replace(/^.*\\(.*)\.js$/, '$1');
    var commonRoutes = new LifeCommonRoutes(app, models.User);

    commonRoutes.addOne(routeBase);
    commonRoutes.update(routeBase + '/:id');
    commonRoutes.findOne(routeBase + '/:id');

    var searchOAuthUser = function(provider, ext_id) {
        return new LifeQuery(models.User.find())
          .filterEquals('ext_oauth_identities.provider', provider)
          .filterEquals('ext_oauth_identities.ext_id', ext_id);
    };

    // get all users
    app.get(routeBase, function (req, res) {
        var query = LifeQuery.fromModel(models.User, req, res);

        return query.
          filterRegexp('name', new RegExp(req.query.name, 'i'), typeof req.query.name !== "undefined")
          .paginate()
          .exec(function(err, data) {
            return api_utils.apiPaginatedResponse(res, req, data);
          });
    });

    // get a single user by its oauth credentials
    app.get(routeBase + '/ext_oauth', function (req, res) {
        searchOAuthUser(req.query.provider, req.query.ext_id)
          .exec(function(err, data) {
            api_utils.apiResponse(res, req, data[0]);
          });
    });

    // add an oauth token to an user
    app.post(routeBase + '/:id/ext_oauth', function (req, res) {
      searchOAuthUser(req.body.provider, req.body.ext_id)
        .exec(function(err, data) {
          if (data.length) {
            return api_utils.apiResponse(res, req, null, error_codes.UserExtTokenAlreadyRegistered);
          }

          return LifeQuery.findById(models.User, req.params.id, function(err, item) {
            var identity = new models.OAuthIdentity(api_utils.requestToObject(req, models.OAuthIdentity));

            item.ext_oauth_identities.push(identity);

            LifeQuery.save(item, function(err, item) {
              return api_utils.apiResponse(res, req, item);
            });
          }, next);
        });
    });
};