var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

module.exports = function(app, models) {
    // get all achievements
    app.get(api_utils.makePath('achievement'), function (req, res) {
          return models.Achievement.find()
            .limit(req.query.limit || api_params.def_limit)
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

    // Update achievement
    app.put(api_utils.makePath('achievement/:id'), function (req, res){
      return models.Achievement.findById(req.params.id, function (err, item) {
        item = api_utils.requestToObject(req, models.Achievement, item);

        return item.save(function (err) {
          return api_utils.apiResponse(res, req, err || item);
        });
      });
    });
};