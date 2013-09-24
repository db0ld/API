var mongoose = require('mongoose'),
    element = require('./Element.js');

var UserConnection = new mongoose.Schema({
    self: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    other: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relation: {type : String, required: true, default: 'network' },
});

UserConnection.index({self: 1, other: 1, relation: 1}, {unique: true});

UserConnection.plugin(element);

UserConnection.statics.queryDefaults.populate = 'self other';

UserConnection.statics.queries.selfOtherRelation = function (self, other, rel) {
    var filter = {$and: [
        {'self': self},
        {'other': other},
        {'relation': rel}
    ]};

    this._query.and(filter);

    return this;
};

UserConnection.statics.queries.selfRelation = function (self, other, rel) {
    var filter = {$and: [
        {'self': self},
        {'relation': rel}
    ]};

    this._query.and(filter);

    return this;
};

UserConnection.statics.queries.otherRelation = function (self, other, rel) {
    var filter = {$and: [
        {'other': other},
        {'relation': rel}
    ]};

    this._query.and(filter);

    return this;
};

module.exports = mongoose.model('UserConnection', UserConnection);