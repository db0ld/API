var LifeConfig = require('./LifeConfig.js');

var LifeResponse = function() {

};

var toJSON = function(req, res, item) {
    if (item !== null && typeof item.toJSON == "function" && item.schema &&
      item.schema.options && item.schema.options.toJSON) {

      var jsonOptions = item.schema.options.toJSON;

      if (req) {
        jsonOptions.token = req.token;
      }

      return item.toJSON(jsonOptions);
    }

    return item;
};

LifeResponse.paginatedList = function(req, res, data, serverSize, query) {
  data = (typeof data === "undefined") ?
    [] : data;

  if (req && typeof req.token == "object" && typeof data == "object" && typeof data.forEach == "function") {
    data = data.map(function(item) {
      return toJSON(res, req, item);
    });
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

    if (req && req.callback) {
        return res.jsonp(returnData);
    }

    return res.send(returnData);
};

LifeResponse.sendList = function(req, res, data, serverSize, error, query) {
  LifeResponse.send(req, res, LifeResponse.paginatedList(req, res, data, serverSize, query), error);
};

module.exports = LifeResponse;