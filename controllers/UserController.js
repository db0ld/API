var User = require('mongoose').model('User'),
    Friendship = require('mongoose').model('Friendship'),
    Conversation = require('mongoose').model('Conversation'),
    Message = require('mongoose').model('Message'),
    Picture = require('mongoose').model('Picture'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeUpload = require('../wrappers/LifeUpload.js'),
    LifeResponse = require('../wrappers/LifeResponse.js'),
    routeBase = 'users';


var createConversation = function (lifequery, usera, userb, callback) {
    var conversation = new Conversation({
        referenced_users: [usera, userb]
    });

    return lifequery.save(conversation, function (conversation) {
        lifequery.findById(conversation.id)
            .execOne(callback);
    });
};

module.exports = function (router) {

    router


        .Post('Create a user')
        .route(routeBase)
        .input(User.creationValidation)
        .output(User)
        .add(function (req, res, next, params) {
            return new LifeQuery(User, req, res, next)
                .save(null, params);
        })


        .Get('Get users')
        .route(routeBase)
        .list(User)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .term(req.query.term)
                .exec();
        })


        .Get('Get a user')
        .route(routeBase + '/:user_id')
        .output(User)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne();
        })


        .Delete('Delete a user')
        .route(routeBase + '/:user_id')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.security.getUsername(req.params.user_id))
                .remove();
        })


        .Put('Edit a user')
        .route(routeBase + '/:user_id')
        .input(User.modificationValidation)
        .output(User)
        .auth(true)
        .add(function (req, res, next, params) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.security.getUsername(req.params.user_id))
                .execOne(false, function (user) {
                    return new LifeQuery(User, req, res, next).save(user, params);
                });
        })


        .Get('Get a conversation')
        .route(routeBase + '/:user_id/conversation')
        .output(Conversation)
        .auth(true)
        .add(function (req, res, next) {
            var messagesQuery;

            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    new LifeQuery(Conversation, req, res, next)
                        .findByUsers([user, req.user])
                        .execOne(true, function (conversation) {
                            if (conversation === null) {
                                return createConversation(new LifeQuery(Conversation, req, res, next), user, req.user);
                            }

                            return new LifeResponse(req, res).single(conversation);
                        });
                });
        })


        .Post('Post message in conversation')
        .route(routeBase + '/:user_id/conversation')
        .input({message: {type: String}})
        .output(Conversation)
        .auth(true)
        .add(function (req, res, next, params) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    new LifeQuery(Conversation, req, res, next)
                        .findByUsers([user, req.user])
                        .execOne(true, function (conversation) {
                            var addMessageToConversation = function (conversation) {
                                var i,
                                    sender_ref = null,
                                    message;

                                for (i = 0; i < conversation.referenced_users.length; i = i + 1) {
                                    if (conversation.referenced_users[i]._id === req.user.id) {
                                        sender_ref = i;
                                        break;
                                    }
                                }

                                if (sender_ref === null) {
                                    return next(LifeErrors.NotFound);
                                }

                                // Creating message
                                message = new Message({
                                    sender_ref: sender_ref,
                                    content: params.message,
                                    _conversation: conversation._id
                                });

                                return new LifeQuery(Message, req, res, next).save(message);
                            };

                            // Create conversation if it doesn't exist
                            if (conversation === null) {
                                return createConversation(new LifeQuery(Conversation, req, res, next), user, req.user, addMessageToConversation);
                            }

                            addMessageToConversation(conversation);
                        });
                });
        })


        .Delete('Remove message from conversation')
        .route(routeBase + '/:user_id/conversation/:message_id')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    new LifeQuery(Conversation, req, res, next)
                        .findByUsers([user, req.user])
                        .execOne(false, function (conversation) {
                            new LifeQuery(Message, req, res, next)
                                .findByConversation(conversation)
                                .findById(req.params.message_id)
                                .remove();
                        });
                });
        })


        .Get('Get friends for users')
        .route(routeBase + '/:user_id/friends')
        .list(User)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    return new LifeQuery(User, req, res, next)
                        .findFriends(user.id)
                        .term(req.query.term)
                        .exec();
                });
        })


        .Post('Make a friend request/approve a friend request')
        .route(routeBase + '/:user_id/friends')
        .input({})
        .output(Friendship)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    if (user.id === req.user.id) {
                        return next(LifeErrors.UserLogicError);
                    }

                    new LifeQuery(Friendship, req, res, next)
                        .findByLogins(user.login, req.user.login)
                        .execOne(true, function (friendship) {
                            if (friendship !== null) {
                                if (friendship.sender_login === req.user.login) {
                                    return next(LifeErrors.UserLogicError);
                                }

                                friendship.acceptedDate = new Date();
                                return new LifeQuery(Friendship, req, res, next).save(friendship);
                            }

                            friendship = new Friendship({
                                sender: req.user,
                                receiver: user,
                                sender_login: req.user.login,
                                receiver_login: user.login
                            });

                            return new LifeQuery(Friendship, req, res, next).save(friendship);
                        });
                });
        })


        .Delete('Remove friend')
        .route(routeBase + '/:user_id/friends/:remover_login')
        .route(routeBase + '/:user_id/friends')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            var remover_user_id = req.security.getUsername(req.params.remover_login);

            new LifeQuery(Friendship, req, res, next)
                .findByLogins(remover_user_id, req.params.user_id)
                .execOne(false, function (friendship) {
                    return new LifeQuery(Friendship, req, res, next)
                        .purge(friendship);
                });
        })


        .Post('Add an avatar to user')
        .route(routeBase + '/:user_id/avatar')
        .input({avatar: { type: LifeUpload.Avatar, required: true }})
        .output(Picture)
        .auth(true)
        .add(function (req, res, next, params) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.security.getUsername(req.params.user_id))
                .execOne(false, function (user) {
                    if (user.avatar) {
                        return user.avatar.remove();
                    }

                    user.avatar = params.avatar;

                    return new LifeQuery(User, req, res, next).save(user);
                });
        })


        .Get('Get a user avatar')
        .route(routeBase + '/:user_id/avatar')
        .output(Picture)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.params.user_id)
                .execOne(false, function (user) {
                    if (!user.avatar) {
                        return next(LifeErrors.NotFound);
                    }

                    return new LifeResponse(req, res).single(user.avatar);
                });
        })


        .Delete('Delete a user avatar')
        .route(routeBase + '/:user_id/avatar')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .findByLogin(req.security.getUsername(req.params.user_id))
                .execOne(false, function (user) {
                    if (user.avatar) {
                        user.avatar.remove();
                    }

                    user.avatar = null;

                    return new LifeQuery(User, req, res, next).save(user);
                });
        });
};
