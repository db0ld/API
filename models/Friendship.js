var User = require('mongoose').model('User');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var element = require('./Element.js');

var FriendshipSchema = new mongoose.Schema({
    sender: {type: ObjectId, required: true, ref: 'User'},
    receiver: {type: ObjectId, required: true, ref: 'User'},
    sender_login: {type: String, required: true},
    receiver_login: {type: String, required: true},
    acceptedDate: {type: Date, required: false}
});

FriendshipSchema.plugin(element);

FriendshipSchema.statics.queryDefaults = function() {
    return {
        'populate': 'sender receiver',
        'limit': 10,
        'offset': 0
    };
};

FriendshipSchema.post('save', function(doc) {
    if (doc.acceptedDate) {
        [{a: doc.sender, b: doc.receiver},
            {b: doc.sender, a: doc.receiver}].forEach(function(userPair) {
                new LifeQuery(User).findById(userPair.a, function(usera) {
                    new LifeQuery(User).findById(userPair.b, function(userb) {
                        var alreadyFriend = false;

                        for (var i in usera._friends) {
                            if (usera._friends[i].id == userb.id) {
                                alreadyFriend = true;
                                break;
                            }
                        }

                        if (!usera._friends instanceof Array) {
                            usera._friends = [];
                        }


                        if (!alreadyFriend) {
                            usera._friends.push(userb);

                            usera.save();
                        }
                    });
                });
            }
        );
    }
});

FriendshipSchema.post('remove', function(doc) {
    [{a: doc.sender_login, b: doc.receiver},
        {b: doc.sender, a: doc.receiver_login}].forEach(function(userPair) {
            new User.findByLogin(userPair.a)
                .populate('')
                .execOne(false, function(user) {
                    user._friends.remove(userPair.b);
                    user.save();
            });
        }
    );
});

FriendshipSchema.statics.findByLogins = function(query, login1, login2) {
    var first_order = {};
    var second_order = {};

    if (LifeData.isObjectId(login1)) {
        first_order.sender = login1;
        second_order.receiver = login1;
    } else {
        first_order.sender_login = login1;
        second_order.receiver_login = login1;
    }

    if (LifeData.isObjectId(login2)) {
        second_order.sender = login2;
        first_order.receiver = login2;
    } else {
        second_order.sender_login = login2;
        first_order.receiver_login = login2;
    }

    return query.or([first_order, second_order]);
};

FriendshipSchema.statics.findByLogin = function(query, login) {
    var criteria = [{receiver_login: login}, {sender_login: login}];

    if (LifeData.isObjectId(login)) {
        criteria = [{receiver: login}, {sender: login}];
    }

    return query.or([{receiver_login: login}, {sender_login: login}]);
};

var Friendship = mongoose.model('Friendship', FriendshipSchema);
