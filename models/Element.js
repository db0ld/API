var mongoose = require('mongoose');
var LifeData = require('../wrappers/LifeData.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function (schema, options) {
    schema.add({
        modification: Date,
        creation: {type: Date, 'default' : Date.now }
    });

    schema.pre('save', function (next) {
        this.modification = new Date();
        next();
    });

    schema.methods.arrayJson = function(req, res, level, doc, keys, cb) {
        var that = this;

        if (keys.length === 0) {
            return cb(doc);
        }

        var i = keys.shift();

        if (that[i]) {
            return new LifeResponse(req, res)
                .paginate(that[i], [], that[i].length, null, function(subdoc) {
                    doc[i] = subdoc;

                    return that.arrayJson(req, res, level, doc, keys, cb);
                }, level);
        }

        return that.arrayJson(req, res, level, doc, keys, cb);
    };

    schema.methods.objJson = function(req, res, level, doc, keys, cb) {
        var that = this;

        if (keys.length === 0) {
            return cb(doc);
        }

        var i = keys.shift();

        return new LifeResponse(req, res).json(that[i], function(subdoc) {
            doc[i] = subdoc;

            return that.objJson(req, res, level, doc, keys, cb);
        }, level);
    };

    schema.methods.fullJson = function(req, res, level, cb) {
        var that = this;
        var doc = that.toJSON();
        var keys_objs = [];
        var keys_arrays = [];

        for (var i in doc) {
            if (i.substring(0, 1) == '_') {
                delete doc[i];

            } else if (doc[i] instanceof Date) {
                doc[i] = LifeData.dateTimeToString(doc[i]);

            } else if (doc[i] instanceof Array) {
                keys_arrays.push(i);

            } else if (that[i] && that[i] instanceof mongoose.Document) {
                keys_objs.push(i);
            }
        }

        level++;

        return that.arrayJson(req, res, level, doc, keys_arrays, function(doc) {
            return that.objJson(req, res, level, doc, keys_objs, function(doc) {
                if (typeof that.jsonAddon == "function") {
                    return that.jsonAddon(req, res, level, doc, function(doc) {
                        return cb(doc);
                    });
                }

                return cb(doc);
            });
        });
    };

    schema.options.toJSON = {
        getters: true,
        virtuals: true
    };
};
