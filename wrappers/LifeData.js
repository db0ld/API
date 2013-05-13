var LifeErrors = require('./LifeErrors.js');
var LifeResponse = require('./LifeResponse.js');

var LifeData = function(model, res, req) {
    this.model = model;
    this.res = res;
    this.req = req;

    return this;
};

LifeData.prototype.save = function(item, next, cb) {
    var that = this;

    item.save(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(that.req, that.res);
        }

        return LifeResponse.send(that.res, that.req, item);
    });
};

LifeData.prototype.delete = function(item, next, cb) {
    var that = this;

    item.delete(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(that.req, that.res);
        }

        return LifeResponse.send(that.res, that.req, item);
    });
};

LifeData.prototype.saveFromRequest = function(next, cb) {
    var that = this;

    var item = new that.model(LifeData.requestToObject());

    that.save(item, function(err, item) {
        if (typeof cb !== "undefined") {
            return cb(item, that.req, that.res, next);
        }

        return LifeResponse.send(that.res, that.req, item);
    }, next);
};

LifeData.prototype.findById = function(id, next, cb) {
    return this.model.findById(id, function (err, item) {
        if (err) {
            console.error(err);
            return next(LifeErrors.IOErrorDB);
        }

        if (item === null) {
          return next(LifeErrors.NotFound);
        }

        return cb(item);
    });
};

LifeData.requestToObject = function(req, model, data) {
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

LifeData.prototype.requestToObject = function(data) {
  return LifeData.requestToObject(this.req, this.model, data);
};

module.exports = LifeData;