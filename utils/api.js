var api_params = require('../config.js');

var apiResponse = function(res, req, data) {
    if (req.callback) {
        return res.jsonp(data);
    }

    return res.send(data);
};

var requestToObject = function(req, model, data) {
  if (typeof data !== 'object') {
    data = {};
  }

  for (var label in model.schema.paths) {
    if (req.body[label]) {
      data[label] = req.body[label];
    }
  }

  return data;
};

var makePath = function(res) {
  return api_params['api_path'] + 'v' + api_params['version'] + '/' + res;
};

module.exports = {
  apiResponse: apiResponse,
  requestToObject: requestToObject,
  makePath: makePath
};
