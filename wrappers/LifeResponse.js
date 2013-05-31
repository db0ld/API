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

var toJSON = function(req, res, item, level) {
    if (typeof level != "Number") {
      level = 0;
    }

    if (item instanceof mongoose.Document) {
      item._req = req;

      var doc = item.toJSON();

      for (var i in doc) {
          if (i.substring(0, 1) == '_') {
              delete doc[i];
          } else if (doc[i] instanceof Date) {
              doc[i] = LifeResponse.dateTimeToString(doc[i]);
          } else if (doc[i] instanceof Array) {
              doc[i] = LifeResponse.paginatedList(req, res, item[i], item[i].length);
          } else if (item[i] && item[i] instanceof mongoose.Document) {
              if (level == 3) {
                doc[i] = item[i]._id;
              } else {
                doc[i] = toJSON(req, res, item[i], level + 1);
              }
          }
      }

      return doc;
    }

    return item;
};

LifeResponse.paginatedList = function(req, res, in_data, serverSize, query) {
  data = (typeof in_data === "undefined") ?
    [] : in_data;

    data = data.map(function(item) {
      return toJSON(req, res, item);
    });

  serverSize = (typeof serverSize === "undefined") ?
    data.length : serverSize;

  return {
    server_size: parseInt(serverSize, 10),
    index: (query && typeof query.offset === 'function') ? query.offset() : 0,
    limit: (query && typeof query.limit === 'function') ? query.limit() : in_data.length,
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