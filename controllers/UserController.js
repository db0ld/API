var User = require('mongoose').model('User'),
    Friendship = require('mongoose').model('Friendship'),
    Conversation = require('mongoose').model('Conversation'),
    Message = require('mongoose').model('Message'),
    Picture = require('mongoose').model('Picture'),
    LifeErrors = require('../wrappers/LifeErrors.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeUpload = require('../wrappers/LifeUpload.js'),
    LifeResponse = require('../wrappers/LifeResponse.js'),
    routeBase = 'users';


var createConversation = function(lifedata, usera, userb, callback) {
    var conversation = new Conversation({
        referenced_users: [usera, userb]
    });

    return lifedata.save(conversation, callback);
};

module.exports = function(router) {

    (router)


    .Post(routeBase)
        .doc('Create a user')
        .input(User.creationValidation)
        .output(User)
        .add(function(req, res, next) {
            return new LifeData(User, req, res, next)
                .saveFromRequest(null, User.creationValidation);
        })


    .Get(routeBase)
        .doc('Get users')
        .list(User)
        .add(function (req, res, next) {
            return new LifeQuery(User, req, res, next)
                .modelStatic('term', req.query.term)
                .exec();
        })


    .Get(routeBase + '/:login')
        .doc('Get a user')
        .output(User)
        .add(function (req, res, next) {
            return User.findByLogin(req.params.login, req, res, next).execOne();
        })


    .Delete(routeBase + '/:login')
        .doc('Delete a user')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return User.findByLogin(req.security.getUsername(req.params.login), req, res, next)
                .remove();
        })


    .Put(routeBase + '/:login')
        .doc('Edit a user')
        .output(User)
        .auth(true)
        .input(User.modificationValidation)
        .add(function (req, res, next) {
            return User.findByLogin(req.security.getUsername(req.params.login), req, res, next).execOne(false, function(user) {
                return new LifeData(User, req, res, next).saveFromRequest(user, User.modificationValidation);
            });
        })


    .Get(routeBase + '/:login/conversation')
        .doc('Get a conversation')
        .output(Conversation)
        .auth(true)
        .add(function (req, res, next) {
            var messagesQuery;

            return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
                new LifeQuery(Conversation, req, res, next).modelStatic('findByUsers', [user, req.user]).execOne(true, function(conversation) {
                    if (conversation === null) {
                        return createConversation(new LifeData(Conversation, req, res, next), user, req.user);
                    }

                    return new LifeResponse(req, res).single(conversation);
                });
            });
        })


    .Post(routeBase + '/:login/conversation')
        .doc('Post message in conversation')
        .output(Conversation)
        .auth(true)
        .add(function (req, res, next) {
            return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
                Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.user]).execOne(true, function(conversation) {
                    var addMessageToConversation = function(conversation) {

                        // Search sender_ref for current user
                        var sender_ref = null;
                        for (var i = 0; i < conversation.referenced_users.length; i++) {
                            if (conversation.referenced_users[i]._id == req.user.id) {
                                sender_ref = i;
                                break;
                            }
                        }

                        if (sender_ref === null) {
                            return next(LifeErrors.NotFound);
                        }

                        // Creating message
                        var message = new Message({
                            sender_ref: sender_ref,
                            content: req.body.message,
                            _conversation: conversation._id
                        });

                        return new LifeData(Message, req, res, next).save(message);
                    };

                    // Create conversation if it doesn't exist
                    if (conversation === null) {
                        return createConversation(new LifeData(Conversation, req, res, next), user, req.user, addMessageToConversation);
                    }

                    addMessageToConversation(conversation);
                });
            });
        })


    .Delete(routeBase + '/:login/conversation/:message_id')
        .doc('Remove message from conversation')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
                Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.user]).execOne(false, function(conversation) {
                    Message.findByConversationAndId(new LifeQuery(Message, req, res, next), conversation, req.params.message_id).remove();
                });
            });
        })


    .Get(routeBase + '/:login/friends')
        .doc('Get friends for users')
        .list(User)
        .auth(true)
        .add(function(req, res, next) {
            return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
                return User.findFriends(user.id, req, res, next)
                    .modelStatic('term', req.query.term).exec();
            });
        })


    .Post(routeBase + '/:login/friends')
        .doc('Make a friend request/approve a friend request')
        .output(Friendship)
        .auth(true)
        .add(function(req, res, next) {
            return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
                if (user.id == req.user.id) {
                    return next(LifeErrors.UserLogicError);
                }

                new LifeQuery(Friendship, req, res, next)
                    .modelStatic('findByLogins', user.login, req.user.login).execOne(true, function(friendship) {
                        if (friendship !== null) {
                            if (friendship.sender_login === req.user.login) {
                                return next(LifeErrors.UserLogicError);
                            }

                            friendship.acceptedDate = new Date();
                            return new LifeData(Friendship, req, res, next).save(friendship);
                        }

                        friendship = new Friendship({
                            sender: req.user,
                            receiver: user,
                            sender_login: req.user.login,
                            receiver_login: user.login
                        });

                        return new LifeData(Friendship, req, res, next).save(friendship);
                });
            });
        })


    .Delete(routeBase + '/:login/friends')
        .route(routeBase + '/:login/friends/:remover_login')
        .doc('Remove friend')
        .output(Number)
        .auth(true)
        .add(function(req, res, next) {
            var remover_user_id = req.security.getUsername(req.params.remover_login);

            new LifeQuery(Friendship, req, res, next)
                .modelStatic('findByLogins', remover_user_id, req.params.login)
                .execOne(false, function(friendship) {
                    return new LifeData(Friendship, req, res, next)
                        .remove(friendship);
                });
        })


    .Post(routeBase + '/:login/avatar')
        .doc('Add an avatar to user')
        .output(Picture)
        .auth(true)
        .add(function (req, res, next) {
            return User.findByLogin(req.security.getUsername(req.params.login), req, res, next)
                .execOne(false, function(user) {
                    new LifeData(User, req, res, next).whitelist({avatar: { type: LifeUpload.Avatar, required: true }}, null, function(params) {
                        if (user.avatar) {
                            return user.avatar.remove();
                        }

                        user.avatar = params.avatar;

                        return new LifeData(User, req, res, next).save(user);
                    });
                });
        })


    .Get(routeBase + '/:login/avatar')
        .doc('Get a user avatar')
        .output(Picture)
        .add(function (req, res, next) {
            return User.findByLogin(req.params.login, req, res, next)
                .execOne(false, function(user) {
                    if (!user.avatar) {
                        return next(LifeErrors.NotFound);
                    }

                    return new LifeResponse(req, res).single(user.avatar);
                });
        })


    .Delete(routeBase + '/:login/avatar')
        .doc('Delete a user avatar')
        .output(Number)
        .auth(true)
        .add(function (req, res, next) {
            return User.findByLogin(req.security.getUsername(req.params.login), req, res, next)
                .execOne(false, function(user) {
                    if (user.avatar) {
                        user.avatar.remove();
                    }

                    user.avatar = null;

                    return new LifeData(User, req, res, next).save(user);
                });
        });
};
