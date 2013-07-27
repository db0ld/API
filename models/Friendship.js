var User = require('mongoose').model('User'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    element = require('./Element.js');

var FriendshipSchema = new mongoose.Schema({
    sender: {type: ObjectId, required: true, ref: 'User'},
    receiver: {type: ObjectId, required: true, ref: 'User'},
    sender_login: {type: String, required: true},
    receiver_login: {type: String, required: true},
    acceptedDate: {type: Date, required: false}
});

FriendshipSchema.plugin(element);

FriendshipSchema.post('save', function (doc) {
    if (doc.acceptedDate) {
        [{a: doc.sender, b: doc.receiver},
            {b: doc.sender, a: doc.receiver}].forEach(function (userPair) {
            new LifeQuery(User)
                .findByLogin(userPair.a)
                .execOne(true, function (usera) {
                    new LifeQuery(User)
                        .findByLogin(userPair.b)
                        .execOne(true, function (userb) {
                            var alreadyFriend = false,
                                i;

                            for (i = usera._friends.length - 1; i >= 0; i = i - 1) {
                                if (usera._friends[i].id === userb.id) {
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
        });
    }
});

FriendshipSchema.post('remove', function (doc) {
    [{a: doc.sender_login, b: doc.receiver},
        {b: doc.sender, a: doc.receiver_login}].forEach(function (userPair) {
        new LifeQuery(User)
            .findByLogin(userPair.a)
            .populate('')
            .execOne(false, function (user) {
                user._friends.remove(userPair.b);
                user.save();
            });
    });
});

FriendshipSchema.statics.queryDefaults = function () {
    return {
        'populate': 'sender receiver',
        'limit': 10,
        'index': 0
    };
};

FriendshipSchema.statics.queries.findByLogins = function (login1, login2) {
    var first_order = {},
        new_order = {};

    if (LifeData.isObjectId(login1)) {
        first_order.sender = login1;
        new_order.receiver = login1;
    } else {
        first_order.sender_login = login1;
        new_order.receiver_login = login1;
    }

    if (LifeData.isObjectId(login2)) {
        new_order.sender = login2;
        first_order.receiver = login2;
    } else {
        new_order.sender_login = login2;
        first_order.receiver_login = login2;
    }

    return this.or([first_order, new_order]);
};

FriendshipSchema.statics.queries.findByLogin = function (login) {
    var criteria = [{receiver_login: login}, {sender_login: login}];

    if (LifeData.isObjectId(login)) {
        criteria = [{receiver: login}, {sender: login}];
    }

    return this.or([{receiver_login: login}, {sender_login: login}]);
};

var Friendship = mongoose.model('Friendship', FriendshipSchema);
