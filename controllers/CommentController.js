var mongoose = require('mongoose'),
	Comment = mongoose.model('Comment'),
	Vote = mongoose.model('Vote');


module.exports = function (router) {
    router

        .Delete('Remove a comment approval')
        .route('comments/:comment_id/approvers')
        .auth(true)
        .params([
            new LifeConstraints.MongooseObjectId(Comment, 'comment_id'),
        ])
        .add(function (context) {
            return Vote.removeUserVote(context, context.user(), context.params('comment_id'))
        })
        ;
};
	