var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

module.exports = function(app, models) {
    // get all achievements
    app.get(api_utils.makePath('achievements'), function (req, res) {
        var query = models.Achievement.find();

        if (req.query.name) {
          query = query.where('name.value', new RegExp(req.query.name, 'i'));

          if (req.query.locale) {
            query = query.where('name.isoCode').equals(req.query.locale);
          }
        }

        if (req.query.description) {
          query = query.where('description.value', new RegExp(req.query.description, 'i'));

          if (req.query.locale) {
            query = query.where('description.isoCode').equals(req.query.locale);
          }
        }

        return api_utils.paginateQuery(req, query)
          .exec(function (err, items) {
            if (err) {
              return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
            }

            return api_utils.apiPaginatedResponse(res, req, items);
        });
    });

    // get a single achievement
    app.get(api_utils.makePath('achievements/:id'), function (req, res) {
      return models.Achievement.findById(req.params.id, function (err, item) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        return api_utils.apiResponse(res, req, item);
      });
    });

    // add an achievement
    app.post(api_utils.makePath('achievements'), function (req, res) {
      var item = new models.Achievement(api_utils.requestToObject(req, models.Achievement));
      item.save(function (err) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        return api_utils.apiResponse(res, req, err);
      });
    });

    // Update achievement -- not really tested
    app.put(api_utils.makePath('achievements/:id'), function (req, res){
      return models.Achievement.findById(req.params.id, function (err, item) {
        if (err) {
          return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
        }

        item = api_utils.requestToObject(req, models.Achievement, item);

        return item.save(function (err) {
          if (err) {
            return api_utils.apiResponse(res, req, err, error_codes.IOErrorDB);
          }

          return api_utils.apiResponse(res, req, err || item);
        });
      });
    });
};