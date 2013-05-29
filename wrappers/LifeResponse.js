var mongoose = require('mongoose');
var LifeConfig = require('./LifeConfig.js');

var LifeResponse = function() {

};

LifeResponse.zeroPad = function(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }

    return zeroString+n;
};

LifeResponse.dateToString = function(d) {
    return LifeResponse.zeroPad(d.getUTCFullYear(), 4) + "-" +
      LifeResponse.zeroPad(d.getUTCMonth() + 1, 2) + "-" +
      LifeResponse.zeroPad(d.getUTCDate(), 2);
};

LifeResponse.dateTimeToString = function(d) {
    return LifeResponse.dateToString(d) + "T" +
      LifeResponse.zeroPad(d.getUTCHours(), 2) + ":" +
      LifeResponse.zeroPad(d.getUTCMinutes(), 2) + ":" +
      LifeResponse.zeroPad(d.getUTCSeconds(), 2) + "Z";
};

var toJSON = function(req, res, item) {
    if (item instanceof mongoose.Document) {
      item._req = req;

      var doc = item.toJSON();

      for (var i in doc) {
          if (i.substring(0, 1) == '_') {
              delete doc[i];
          } else if (doc[i] instanceof Date) {
              doc[i] = LifeResponse.dateTimeToString(doc[i]);
          }
      }

      return doc;
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