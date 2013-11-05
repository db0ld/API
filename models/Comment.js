var mongoose = require('mongoose'),
    approvable = require('./Approvable.js'),
    element = require('./Element.js');

var Comment = new mongoose.Schema({
    author: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: {type : mongoose.Schema.Types.ObjectId, required: true },
    content: {type : String, required: true }
});

Comment.plugin(element);
Comment.plugin(approvable);

Comment.statics.queryDefaults.populate = 'author';

Comment.statics.queries.byParent = function (id) {
    this._query.and({
        parent: id
    });

    return this;
};

module.exports = mongoose.model('Comment', Comment);