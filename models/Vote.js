var mongoose = require('mongoose'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    element = require('./Element.js');

var Vote = new mongoose.Schema({
    author: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: {type : mongoose.Schema.Types.ObjectId, required: true },
    vote: {type : Number, required: true }
});

Vote.plugin(element);

Vote.statics.queryDefaults.populate = 'author';

Vote.statics.removeUserVote = function(context, user, object, cb) {
    var VoteModel = mongoose.model('Vote');

    if (cb === undefined) {
        cb = function () {
            return context.send.single(object);
        }
    }

    return new LifeQuery(VoteModel, context)
        .voteByUser(object.id, user.id)
        .remove(cb);
};

Vote.statics.registerUserVote = function(context, user, object, value, cb) {
    var VoteModel = mongoose.model('Vote');

    return new LifeQuery(VoteModel, context)
        .voteByUser(object.id, user.id)
        .execOne(true, function (vote) {
            if (vote === null) {
                vote = new VoteModel();
                vote.parent = object.id;
                vote.author = user.id;
            }

            vote.vote = value;

            if (cb === undefined) {
                cb = function () {
                    return context.send.single(object);
                }
            }

            return this.save(vote, cb);
        })
};

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