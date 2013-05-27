var mongoose = require('mongoose');
var LifeConfig = require('./LifeConfig.js');

var LifeResponse = function() {

};

var toJSON = function(req, res, item) {
    if (item instanceof mongoose.Document) {
      item._req = req;
      return item.toJSON();
    }

    return item;
};

LifeResponse.paginatedList = function(req, res, in_data, serverSize, query) {
  data = (typeof in_data === "undefined") ?
    [] : in_data;

    for (var i in in_data) {
      data[i] = toJSON(req, res, in_data[i]);
    }

  serverSize = (typeof serverSize === "undefined") ?
    data.length : serverSize;

  return {
    server_size: parseInt(serverSize, 10),
    index: (query && typeof query.offset === 'function') ? query.offset() : 0,
    limit: (query && typeof query.limit === 'function') ? query.limit() : 0,
    items: data
  };
};

LifeResponse.send = function(req, res, data, error) {
    // handling empty parameters
    data = (typeof data === "undefined") ?
      null : data;

    data = toJSON(req, res, data);

    var returnData = {
      "error": typeof error === "undefined" ? null : error,
      "element": data
    };

    if (req && req.query.callback) {
        return res.jsonp(returnData);
    }

    var http_code = 200;
    if (error && error.http) {
      http_code = error.http;
      delete error.http;
    }

    return res.send(http_code, returnData);
};

LifeResponse.sendList = function(req, res, data, serverSize, error, query) {
  LifeResponse.send(req, res, LifeResponse.paginatedList(req, res, data, serverSize, query), error);
};

module.exports = LifeResponse;