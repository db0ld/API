var mongoose = require('mongoose'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function (schema, options) {
    schema.add({
        modification: Date,
        creation: {type: Date, 'default' : Date.now }
    });

    schema.pre('save', function (next) {
        this.modification = new Date();
        next();
    });

    schema.methods.objIdsJson = function (context, level, doc, keys, cb) {
        var that = this,
            i,
            modelName,
            model;

        if (keys.length === 0) {
            return cb(doc);
        }

        i = keys.shift();

        if (that[i] &&
                that.schema.paths[i] &&
                that.schema.paths[i].instance === "ObjectID" &&
                that.schema.paths[i].options.ref) {
            modelName = that.schema.paths[i].options.ref;
            model = mongoose.model(modelName);

            return new LifeQuery(model, context, {_id: that[i]})
                .execOne(true, function (item) {
                    return new LifeResponse(context).json(item, function (subdoc) {
                        doc[i] = subdoc;

                        return that.objIdsJson(context, level, doc, keys, cb);
                    }, level);
                });
        }

        return that.objIdsJson(context, level, doc, keys, cb);
    };

    schema.methods.arrayJson = function (context, level, doc, keys, cb) {
        var that = this,
            i;

        if (keys.length === 0) {
            return cb(doc);
        }

        i = keys.shift();

        if (that[i]) {
            return new LifeResponse(context)
                .paginate(that[i], [], that[i].length, null, function (subdoc) {
                    doc[i] = subdoc;

                    return that.arrayJson(context, level, doc, keys, cb);
                }, level);
        }

        return that.arrayJson(context, level, doc, keys, cb);
    };

    schema.methods.objJson = function (context, level, doc, keys, cb) {
        var that = this,
            i;

        if (keys.length === 0) {
            return cb(doc);
        }

        i = keys.shift();

        return new LifeResponse(context).json(that[i], function (subdoc) {
            doc[i] = subdoc;

            return that.objJson(context, level, doc, keys, cb);
        }, level);
    };

    schema.methods.fullJson = function (context, level, cb) {
        if (level >= 4) {
            return null;
        }

        var that = this,
            doc = that.toJSON(),
            keys_objs = [],
            keys_objids = [],
            keys_arrays = [],
            i;

        for (i in doc) {
            if (doc.hasOwnProperty(i)) {
                if (i.substring(0, 1) === '_') {
                    delete doc[i];

                } else if (doc[i] instanceof Date) {
                    doc[i] = LifeData.dateTimeToString(doc[i]);

                } else if (doc[i] instanceof Array) {
                    keys_arrays.push(i);

                } else if (i !== 'id' && LifeData.isObjectId(doc[i])) {
                    keys_objids.push(i);

                } else if (that[i] && that[i] instanceof mongoose.Document) {
                    keys_objs.push(i);
                }
            }
        }

        return that.objIdsJson(context, level, doc, keys_objids, function (doc) {
            return that.arrayJson(context, level, doc, keys_arrays, function (doc) {
                return that.objJson(context, level, doc, keys_objs, function (doc) {
                    if (typeof that.jsonAddon === "function") {
                        return that.jsonAddon(context, level, doc, function (doc) {
                            return cb(doc);
                        });
                    }

                    return cb(doc);
                });
            });
        });
    };

    schema.options.toJSON = {
        getters: true,
        virtuals: true
    };

    schema.statics.queries = {};

    schema.statics.queryDefaults = {
        'populate': 'referenced_users',
        'limit': 10,
        'index': 0,
        'sort': '-creation'
    };
};
