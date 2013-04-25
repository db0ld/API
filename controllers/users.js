var api_utils = require('../utils/api.js');
var error_codes = require('../utils/error_codes.js');
var api_params = require('../config.js');

module.exports = function(app, models) {
    var searchOAuthUser = function(provider, ext_id, cb) {
        var query = models.User
          .find()
          .where('ext_oauth_identities.provider').equals(provider)
          .where('ext_oauth_identities.ext_id').equals(ext_id)
          .exec(cb);
    };

    // get all users
    app.get(api_utils.makePath('users'), function (req, res) {
        var query = models.User.find();

        if (req.query.name)
          query = query.where('name', new RegExp(req.query.name, 'i'));

        return api_utils.paginateQuery(req, query)
          .exec(function (err, items) {
            if (err) {
              return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
            }

            return api_utils.apiPaginatedResponse(res, req, items);
        });
    });

    // get a single user by its oauth credentials
    app.get(api_utils.makePath('users/ext_oauth'), function (req, res) {
      return models.User.findById(req.params.name, function (err, item) {
        searchOAuthUser(req.query.provider, req.query.ext_id, function(err, items) {
          if (err) {
            return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
          }

          if (items.length === 0) {
            return api_utils.apiResponse(res, req, null, error_codes.UserNotFound);
          }

          api_utils.apiResponse(res, req, items[0]);
        });
      });
    });

    // get a single user
    app.get(api_utils.makePath('users/:name'), function (req, res) {
      return models.User.findById(req.params.name, function (err, item) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        if (item === null) {
          return api_utils.apiResponse(res, req, null, error_codes.UserNotFound);
        }

        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // add an user
    app.post(api_utils.makePath('users'), function (req, res) {
      var item = new models.User(api_utils.requestToObject(req, models.User));

      item.save(function (err) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // Update user -- not really tested
    app.put(api_utils.makePath('users/:name'), function (req, res){
      return models.User.findById(req.params.name, function (err, item) {
        item = api_utils.requestToObject(req, models.User, item);

        return item.save(function (err) {
          if (err) {
            return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
          }

          return api_utils.apiResponse(res, req, err || item);
        });
      });
    });

    // add an oauth token to an user
    app.post(api_utils.makePath('users/:id/ext_oauth'), function (req, res) {
      searchOAuthUser(req.body.provider, req.body.ext_id, function(err, items) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        if (items.length) {
          return api_utils.apiResponse(res, req, null, error_codes.UserExtTokenAlreadyRegistered);
        }

        return models.User.findById(req.params.id, function (err, item) {
          if (err) {
            return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
          }

          if (item === null) {
            return api_utils.apiResponse(res, req, null, error_codes.UserNotFound);
          }

          var identity = new models.OAuthIdentity(api_utils.requestToObject(req, models.OAuthIdentity));

          item.ext_oauth_identities.push(identity);

          item.save(function (err) {
            if (err) {
              return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
            }

            return api_utils.apiResponse(res, req, err || item);
          });
        });
      });
    });
};