var User = require('mongoose').model('User');
var Friendship = require('mongoose').model('Friendship');
var Conversation = require('mongoose').model('Conversation');
var Message = require('mongoose').model('Message');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeUpload = require('../wrappers/LifeUpload.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function(app) {
    var routeBase = 'users';

    // add a single user
    app.post(routeBase, function (req, res, next) {
        return new LifeData(User, req, res, next).saveFromRequest(null, User.creationValidation);
    });

    // get a single user
    app.get(routeBase + '/:login', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne();
    });

    // delete a single user
    app.delete(routeBase + '/:login', function (req, res, next) {
        return User.findByLogin(req.security.getUsername(req.params.login), req, res, next).remove();
    }, true);

    // update a single user
    app.put(routeBase + '/:login', function (req, res, next) {
        return User.findByLogin(req.security.getUsername(req.params.login), req, res, next).execOne(false, function(user) {
            return new LifeData(User, req, res, next).saveFromRequest(user, User.modificationValidation);
        });
    });

    // get all users
    app.get(routeBase, function (req, res, next) {
        return new LifeQuery(User, req, res, next)
            .modelStatic('term', req.query.term)
            .exec();
    });

    var createConversation = function(lifedata, usera, userb, callback) {
        var conversation = new Conversation({
            referenced_users: [usera, userb]
        });

        return lifedata.save(conversation, callback);
    };

    // Get conversation
    app.get(routeBase + '/:login/conversation', function (req, res, next) {
        var messagesQuery;

        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            new LifeQuery(Conversation, req, res, next).modelStatic('findByUsers', [user, req.user]).execOne(true, function(conversation) {
                if (conversation === null) {
                    return createConversation(new LifeData(Conversation, req, res, next), user, req.user);
                }

                Message.findByConversation(messagesQuery = new LifeQuery(Message, req, res, next), conversation).exec(function (messages, count) {
                    conversation = LifeResponse.toJSON(req, res, conversation);
                    conversation.messages = LifeResponse.paginatedList(req, res, messages, count, messagesQuery);
                    return LifeResponse.send(req, res, conversation);
                });
            });
        });
    }, true);

    // Post new message to conversation
    app.post(routeBase + '/:login/conversation', function (req, res, next) {
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
                        conversation: conversation._id
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
    }, true);

    // Delete message from conversation
    app.delete(routeBase + '/:login/conversation/:message_id', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.user]).execOne(false, function(conversation) {
                Message.findByConversationAndId(new LifeQuery(Message, req, res, next), conversation, req.params.message_id).remove();
            });
        });
    }, true);

    // Get user friends
    app.get(routeBase + '/:login/friends', function(req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            return User.findFriends(user.id, req, res, next)
                .modelStatic('term', req.query.term).exec();
        });
    }, true);

    // Become friend
    app.post(routeBase + '/:login/friends', function(req, res, next) {
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
    }, true);

    // Remove friendship
    app.delete([routeBase + '/:login/friends', routeBase + '/:login/friends/:remover_login'], function(req, res, next) {
        var remover_user_id = req.security.getUsername(req.params.remover_login);

        new LifeQuery(Friendship, req, res, next)
            .modelStatic('findByLogins', remover_user_id, req.params.login)
            .execOne(false, function(friendship) {
                return new LifeData(Friendship, req, res, next)
                    .remove(friendship);
            });
    }, true);

    app.post(routeBase + '/:login/avatar', function (req, res, next) {
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
    }, true);

    app.get(routeBase + '/:login/avatar', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next)
            .execOne(false, function(user) {
                if (!user.avatar) {
                    return next(LifeErrors.NotFound);
                }

                return LifeResponse.send(req, res, user.avatar);
            });
    });

    app.delete(routeBase + '/:login/avatar', function (req, res, next) {
        return User.findByLogin(req.security.getUsername(req.params.login), req, res, next)
            .execOne(false, function(user) {
                if (user.avatar) {
                    user.avatar.remove();
                }

                user.avatar = null;

                return new LifeData(User, req, res, next).save(user);
            });
    }, true);

};
