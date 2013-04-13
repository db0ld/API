var api_utils = require('../utils/api.js');
var api_params = require('../config.js');

module.exports = function(app, models) {
    // get all users
    app.get(api_utils.makePath('user'), function (req, res) {
        var query = models.User.find();

        if (req.query.name)
          query = query.where('name', new RegExp(req.query.name, 'i'));

        return query.limit(req.query.limit || api_params.def_limit)
          .skip(req.query.offset || api_params.def_offset)
          .exec(function (err, items) {
            return api_utils.apiResponse(res, req, err || items);
        });
    });

    // get a single user
    app.get(api_utils.makePath('user/:name'), function (req, res) {
      return models.User.findById(req.params.name, function (err, item) {
        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // add an user
    app.post(api_utils.makePath('user'), function (req, res) {
      var item = new models.User(api_utils.requestToObject(req, models.User));

      item.save(function (err) {
        return api_utils.apiResponse(res, req, err || item);
      });
    });

    // Update user -- not really tested
    app.put(api_utils.makePath('user/:name'), function (req, res){
      return models.User.findById(req.params.name, function (err, item) {
        item = api_utils.requestToObject(req, models.User, item);

        return item.save(function (err) {
          return api_utils.apiResponse(res, req, err || item);
        });
      });
    });
};