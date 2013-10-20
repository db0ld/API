var mongoose = require('mongoose'),
    element = require('./Element.js');

var UserConnection = new mongoose.Schema({
    self: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    other: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relation: {type : String, required: true, default: 'network' },
});

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

UserConnection.statics.queries.selfRelation = function (self, rel) {
    var filter = {$and: [
        {'self': self},
        {'relation': rel}
    ]};

    this._query.and(filter);

    return this;
};

UserConnection.statics.queries.otherRelation = function (other, rel) {
    var filter = {$and: [
        {'other': other},
        {'relation': rel}
    ]};

    this._query.and(filter);

    return this;
};

UserConnection.post('save', function (doc) {
    if (doc.relation !== 'network') {
        return;
    }

    var Activity = require('mongoose').model('Activity');

    Activity.add(doc.self, 'network_addition', {users: [doc.other]});
});

module.exports = mongoose.model('UserConnection', UserConnection);