var User = require('mongoose').model('User');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeQuery = require('../wrappers/LifeQuery.js');

var FriendshipSchema = new mongoose.Schema({
    sender: {type: ObjectId, required: true, ref: 'User'},
    receiver: {type: ObjectId, required: true, ref: 'User'},
    sender_login: {type: String, required: true},
    receiver_login: {type: String, required: true},
    requestDate: {type: Date, 'default' : Date.now },
    acceptedDate: {type: Date, required: false}
});

FriendshipSchema.statics.queryDefaults = function() {
    return {
        'populate': 'sender receiver',
        'limit': 10,
        'offset': 0
    };
};

FriendshipSchema.post('save', function(doc) {
    if (doc.acceptedDate) {
        [{a: doc.sender, b: doc.receiver}, {b: doc.sender, a: doc.receiver}].forEach(function(userPair) {
            new LifeQuery(User).findById(userPair.a, function(usera) {
                new LifeQuery(User).findById(userPair.b, function(userb) {
                    var alreadyFriend = false;

                    for (var i in usera.friends) {
                        if (usera.friends[i].id == userb.id) {
                            alreadyFriend = true;
                            break;
                        }
                    }

                    if (!usera.friends instanceof Array) {
                        usera.friends = [];
                    }


                    if (!alreadyFriend) {
                        usera.friends.push(userb);

                        usera.save();
                    }
                });
            });
        });
    }
});

FriendshipSchema.post('remove', function(doc) {
    // remove from friends property for both user
    [{a: doc.sender, b: doc.receiver}, {b: doc.sender, a: doc.receiver}].forEach(function(userPair) {
        User.find(userPair.a, function(error, user) {
            if (error)
                return;

            user.friends.remove(userPair.b);
            user.save();
        });
    });
});

FriendshipSchema.statics.findByLogins = function(query, login1, login2) {
    return query.or([{sender_login: login1, receiver_login: login2},
        {sender_login: login2, receiver_login: login1}]);
};

var Friendship = mongoose.model('Friendship', FriendshipSchema);
