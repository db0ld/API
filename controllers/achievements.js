var api_utils = require('../utils/api.js');

module.exports = function(app, models) {
    app.get(api_utils.makePath('achievement'), function (req, res) {
          return models.Achievement.find(function (err, items) {
            return api_utils.apiResponse(res, req, err || items);
          });
    });

    app.get(api_utils.makePath('achievement/:id'), function (req, res) {
          return models.Achievement.findById(req.params.id, function (err, item) {
            return api_utils.apiResponse(res, req, err || item);
          });
    });

    app.post(api_utils.makePath('achievement'), function (req, res) {
      var item;

      console.log(req.body);

      item = new models.Achievement(api_utils.requestToObject(models.Achievement));
      item.save(function (err) {
        return api_utils.apiResponse(res, req, err || item);
      });
    });
};