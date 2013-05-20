var User = require('mongoose').model('User');
var Conversation = require('mongoose').model('Conversation');
var Message = require('mongoose').model('Message');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function(app) {
    var routeBase = 'users';

    // add a single user
    app.post(routeBase, function (req, res, next) {
        return new LifeData(User, req, res, next).saveFromRequest();
    });

    // get a single user
    app.get(routeBase + "/:login", function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne();
    });

    // update a single user
    app.put(routeBase + "/:login", function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            return new LifeData(User, req, res, next).saveFromRequest(user);
        });
    });

    // get all users
    app.get(routeBase, function (req, res, next) {
        return new LifeQuery(User, req, res, next)
            .filterRegexp('name', new RegExp(req.query.name, 'i'), typeof req.query.name !== "undefined")
            .exec();
    });

    // Get conversation
    app.get(routeBase + '/:login/conversation', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.token.user]).execOne(false, function(conversation) {
                Message.findByConversation(new LifeQuery(Message, req, res, next), conversation).exec(function (messages, count) {
                    conversation = conversation.toJSON();
                    conversation.messages = LifeResponse.paginatedList(req, res, messages, count);
                    return LifeResponse.send(req, res, conversation);
                });
            });
        });
    });

    // Post new message to conversation
    app.post(routeBase + '/:login/conversation', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.token.user]).execOne(true, function(conversation) {
                var addMessageToConversation = function(conversation) {

                    // Search sender_ref for current user
                    var sender_ref = null;
                    for (var i = 0; i < conversation.referenced_users.length; i++) {
                        if (conversation.referenced_users[i]._id == req.token.user.id) {
                            sender_ref = i;
                            break;
                        }
                    }

                    if (sender_ref === null) {
                        next(LifeErrors.NotFound);
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
                    conversation = new Conversation({
                        referenced_users: [user, req.token.user]
                    });

                    return new LifeData(Conversation, req, res, next).save(conversation, addMessageToConversation);
                }

                addMessageToConversation(conversation);
            });
        });
    });

    // Delete message from conversation
    app.delete(routeBase + '/:login/conversation/:message_id', function (req, res, next) {
        return User.findByLogin(req.params.login, req, res, next).execOne(false, function(user) {
            Conversation.findByUsers(new LifeQuery(Conversation, req, res, next), [user, req.token.user]).execOne(false, function(conversation) {
                Message.findByConversationAndId(new LifeQuery(Message, req, res, next), conversation, req.params.message_id).remove();
            });
        });
    });
};