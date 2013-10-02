var mongoose = require('mongoose'),
    element = require('./Element.js');

var Vote = new mongoose.Schema({
    author: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: {type : mongoose.Schema.Types.ObjectId, required: true },
    vote: {type : Number, required: true }
});

Vote.plugin(element);

Vote.statics.queryDefaults.populate = 'author';

Vote.statics.queries.byParent = function (id) {
    this._query.and({
        parent: id
    });

    return this;
};

Vote.statics.queries.vote = function (id, vote) {
    this._query.and({
        parent: id,
        vote: vote
    });

    return this;
};

Vote.statics.queries.voteByUser = function (id, author) {
    this._query.and({
        parent: id,
        author: author
    });

    return this;
};


module.exports = mongoose.model('Vote', Vote);