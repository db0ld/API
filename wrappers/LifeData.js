var LifeErrors = require('./LifeErrors.js');
var LifeResponse = require('./LifeResponse.js');

var LifeData = function(model, req, res, next) {
    this.model = model;
    this.res = res;
    this.req = req;
    this.next = next;

    return this;
};

LifeData.prototype.save = function(item, cb) {
    var that = this;

    item.save(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(item);
        }

        return LifeResponse.send(that.req, that.res, item);
    });
};

LifeData.prototype.delete = function(item, cb) {
    var that = this;

    item.delete(function (err) {
        if (err) {
            var ret_err = LifeErrors.IOErrorDB;
            ret_err.message = err;
            return that.next(LifeErrors.IOErrorDB);
        }

        if (typeof cb === "function") {
            return cb(item);
        }

        return LifeResponse.send(that.res, that.req, item);
    });
};

LifeData.prototype.saveFromRequest = function(item, cb) {
    var that = this;

    if (typeof item === 'undefined') {
        item = new that.model(that.requestToObject(item));
    } else {
        item = that.requestToObject(item);
    }

    that.save(item, function(item) {
        if (typeof cb !== "undefined") {
            return cb(item, that.req, that.res, that.next);
        }

        return LifeResponse.send(that.req, that.res, item);
    }, that.next);
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