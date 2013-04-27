var api_params = require('../config.js');
var error_codes = require('./error_codes.js');

var apiResponse = function(res, req, data, error) {
    // handling empty parameters
    data = (typeof data === "undefined") ?
      null : data;

    var returnData = {
      "error": typeof error === "undefined" ? error_codes.Success : error,
      "element": data
    };

    if (req.callback) {
        return res.jsonp(returnData);
    }

    return res.send(returnData);
};

var apiPaginatedResponse = function(res, req, data, serverSize, error) {
  serverSize = (typeof serverSize === "undefined") ?
    0 : serverSize;

  var listData = {
    server_size: serverSize,
    index: req.query.offset || api_params.def_offset,
    items: data
  };

  apiResponse(res, req, listData, error);
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
  apiPaginatedResponse: apiPaginatedResponse,
  requestToObject: requestToObject,
  makePath: makePath
};
