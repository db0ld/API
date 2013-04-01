var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

module.exports = function(app, models) {
    // get all achievements
    app.get(api_utils.makePath('achievement'), function (req, res) {
        var query = models.Achievement.find();

        if (req.query.name) {
          query = query.where('name.value', new RegExp(req.query.name, 'i'));

          if (req.query.locale) {
            query = query.where('name.isoCode', req.query.locale);
          }
        }

        if (req.query.description) {
          query = query.where('description.value', new RegExp(req.query.description, 'i'));

          if (req.query.locale) {
            query = query.where('description.isoCode', req.query.locale);
          }
        }

        return query.limit(req.query.limit || api_params.def_limit)
          .skip(req.query.offset || api_params.def_offset)
          .exec(function (err, items) {
            return api_utils.apiResponse(res, req, err || items);
        });
    });

    // get a single achievement
    app.get(api_utils.makePath('achievement/:id'), function (req, res) {
      return models.Achievement.findById(req.params.id, function (err, item) {
        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // add an achievement
    app.post(api_utils.makePath('achievement'), function (req, res) {
      var item = new models.Achievement(api_utils.requestToObject(req, models.Achievement));

      item.save(function (err) {
        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // Update achievement -- not really tested
    app.put(api_utils.makePath('achievement/:id'), function (req, res){
      return models.Achievement.findById(req.params.id, function (err, item) {
        item = api_utils.requestToObject(req, models.Achievement, item);

        return item.save(function (err) {
          return api_utils.apiResponse(res, req, err || item);
        });
      });
    });
};