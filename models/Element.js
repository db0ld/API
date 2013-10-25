var mongoose = require('mongoose'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function (schema, options) {
    schema.methods.objectIdJson = function (i, context, level, doc, cb) {
        var that = this;

        if (true) {
            modelName = that.schema.paths[i].options.ref;
            model = mongoose.model(modelName);

            return new LifeQuery(model, context, {_id: that[i]})
                .execOne(true, function (item) {
                    return new LifeResponse(context).json(item, function (subdoc) {
                        doc[i] = subdoc;

                        return cb(doc);
                    }, level + 1);
                });
        }

        return cb(doc);
    };

    schema.methods.arrayJson = function (i, context, level, doc, cb) {
        var that = this;

        return new LifeResponse(context)
            .paginate(that[i], [], that[i].length, null, function (subdoc) {
                doc[i] = subdoc;

                return cb(doc);
            }, level + 1);
    };

    schema.methods.documentJson = function (i, context, level, doc, cb) {
        var that = this;

        return new LifeResponse(context).json(that[i], function (subdoc) {
            doc[i] = subdoc;

            return cb(doc);
        }, level + 1);
    };

    schema.add({
        modification: {type: Date, 'default' : Date.now },
        creation: {type: Date, 'default' : Date.now }
    });

    schema.pre('save', function (next) {
        this.modification = new Date();
        next();
    });

    schema.methods.abstractJsonSerialize = function (context, level, subJsons, doc, cb) {
        var that = this;

        if (!subJsons.length) {
            return cb(doc);
        }

        var currCb = subJsons.shift();

        return currCb.call(that, context, level, doc, function(doc) {
            return that.abstractJsonSerialize(context, level, subJsons, doc, cb);
        });
    };

    schema.methods.fullJson = function (context, level, cb) {
        if (level >= 4) {
            return cb(null);
        }

        var that = this,
            doc = that.toJSON(),
            subJsons = schema.methods.abstractJson.slice(),
            i;

        for (i in doc) {
            if (doc.hasOwnProperty(i)) {
                if (i.substring(0, 1) === '_') {
                    delete doc[i];

                } else if (doc[i] instanceof Date) {
                    doc[i] = LifeData.dateTimeToString(doc[i]);

                } else if (doc[i] instanceof Array) {
                    subJsons.push(that.arrayJson.bind(that, i));

                } else if (this[i] && that.schema.paths[i] &&
                           that.schema.paths[i].instance === "ObjectID" &&
                           that.schema.paths[i].options.ref && i !== 'id' && LifeData.isObjectId(doc[i])) {

                    subJsons.push(that.objectIdJson.bind(that, i));

                } else if (that[i] && that[i] instanceof mongoose.Document) {
                    subJsons.push(that.documentJson.bind(that, i));
                }
            }
        }

        subJsons.push(that.jsonAddon);

        return that.abstractJsonSerialize(context, level + 1, subJsons, doc, function (doc) {
            return cb(doc);
        });
    };

    schema.methods.jsonAddon = function (context, level, doc, cb) {
        return cb(doc);
    };

    schema.options.toJSON = {
        getters: true,
        virtuals: true
    };

    schema.methods.abstractJson = [];

    schema.statics.queries = {};

    schema.statics.queries.findById = function (id) {
        if (!LifeData.isObjectId(id)) {
            id = "000000000000000000000000";
        }

        this._query.and({_id: id});

        return this;
    };

    schema.statics.queries.findByIds = function (ids) {
        ids = ids.filter(function (id) {
            return LifeData.isObjectId(id);
        });

        this._query.and({_id: {$in: ids}});

        return this;
    };

    schema.post('init', function() {
        this._original = this.toObject();
    });

    schema.statics.queryDefaults = {
        'populate': 'referenced_users',
        'limit': 10,
        'index': 0,
        'sort': '-creation'
    };
};
