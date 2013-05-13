var LifeConfig = require('./LifeConfig.js');

var LifeResponse = function() {

};

var toJSON = function(req, res, item) {
    if (item !== null && typeof item.toJSON == "function" && item.schema &&
      item.schema.options && item.schema.options.toJSON) {

      var jsonOptions = item.schema.options.toJSON;
      jsonOptions.token = req.token;

      return item.toJSON(jsonOptions);
    }

    return item;
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

    if (req.callback) {
        return res.jsonp(returnData);
    }

    return res.send(returnData);
};

LifeResponse.sendList = function(req, res, data, serverSize, error) {
  data = (typeof data === "undefined") ?
    [] : data;

  if (typeof req.token == "object" && typeof data == "object" && typeof data.forEach == "function") {
    data = data.map(function(item) {
      return toJSON(res, req, item);
    });
  }

  serverSize = (typeof serverSize === "undefined") ?
    0 : serverSize;

  var listData = {
    server_size: serverSize,
    index: req.query.offset || LifeConfig.def_offset,
    items: data
  };

  LifeResponse.send(req, res, listData, error);
};

module.exports = LifeResponse;