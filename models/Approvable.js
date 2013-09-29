var mongoose = require('mongoose'),
    LifeQuery = require('../wrappers/LifeQuery.js')
    Vote = mongoose.model('Vote');


module.exports = function (schema, options) {
    schema.methods.abstractJson.push(function (context, level, doc, cb) {
	var that = this;

	new LifeQuery(Vote, context)
	    .vote(that.id, +1)
	    .count(function (count) {
		doc.approvers_total = count;

		return cb(doc);
	    });
    });

    schema.methods.abstractJson.push(function (context, level, doc, cb) {
	var that = this;

	new LifeQuery(Vote, context)
	    .vote(that.id, -1)
	    .count(function (count) {
		doc.disapprovers_total = count;

		return cb(doc);
	    });
    });


    schema.methods.abstractJson.push(function (context, level, doc, cb) {
	var that = this;

	if (!context.user) {
	    return cb(doc);
	}

	new LifeQuery(Vote, context)
	    .voteByUser(that.id, context.user.id || context.user)
	    .exec(function (vote) {
		if (vote) {
		    doc.vote = (vote.vote == 1) ? 'approved' : 'disapproved';
		}

		return cb(doc);
	    });
    });
};
