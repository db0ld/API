var mongoose = require('mongoose'),
	Comment = mongoose.model('Comment'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
	Vote = mongoose.model('Vote');


module.exports = function (router) {
    router

        .Post('Approve or disaprove a comment')
        .route('comments/:comment_id/approvement')
        .auth(true)
        .input([
            new LifeConstraints.ApprovementVote('vote'),
        ])
        .params([
            new LifeConstraints.MongooseObjectId(Comment, 'comment_id'),
        ])
        .add(function (context) {
            return Vote.registerUserVote(context, context.user(), context.params('comment_id'), context.input.vote);
        })

        .Delete('Remove a comment approval')
        .route('comments/:comment_id/approvement')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(Comment, 'comment_id'),
        ])
        .add(function (context) {
            return Vote.removeUserVote(context, context.user(), context.params('comment_id'))
        })        ;
};
	