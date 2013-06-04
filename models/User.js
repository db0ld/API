var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeConfig = require('../wrappers/LifeConfig.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js'),
    regexps = LifeData.regexps;
var LifeResponse = require('../wrappers/LifeResponse.js');
var element = require('./Element.js');

var UserSchema = new mongoose.Schema({
    login: { type : String, match: regexps.login, required: true, unique: true},
    email: { type : String, match: regexps.email, required: true, unique: true},
    firstname: { type : String, match: regexps.name, required: false},
    lastname: { type : String, match: regexps.name, required: false},
    gender: { type : String, match: regexps.gender, required: true},
    lang: { type : String, match: regexps.lang, required: true},
    password: { type : String, required: true },
    birthday: { type: Date, required: false },
    _achievements: [{type: ObjectId, required: false, ref: 'Achievement'}],
    _friends: [{type: ObjectId, required: false, ref: 'User'}]
}, { autoIndex: true });

UserSchema.plugin(element);

UserSchema.virtual('name').get(function () {
  var name = '';

  if (typeof this.firstname === 'string') {
    name = this.firstname;
  }

  if (typeof this.lastname === 'string') {
    if (typeof this.firstname === 'string') {
      name = name + ' ';
    }

    name = name + this.lastname;
  }

  if (name.length === 0) {
    name = this.login;
  }

  return name;
});

UserSchema.virtual('url').get(function () {
  return LifeConfig.website_url + 'user/' + this.login.toLowerCase();
});

UserSchema.options.toJSON = {
    getters: true,
    virtuals: true,
    transform: function(doc, ret, options) {
        obj = doc.toObject({
          virtuals: true
        });

        delete obj.password;
        obj.birthday = LifeResponse.dateToString(doc.birthday);

        if (doc._req === null || typeof doc._req !== 'object' ||
            !doc._req.token || !doc._req.token.user) {
            delete obj.email;
            return obj;
        }

        var isFriend = false;

        doc._friends.forEach(function(friend) {
          if ((doc._req.token.user.id || doc._req.token.user) ==
            (friend.id || friend)) {
            isFriend = true;
          }
        });

        if (doc._req.token.user.id !== doc.id) {
          delete obj.email;
        }

        obj.is_friend = isFriend;

        return obj;
    }
};

UserSchema.statics.queryDefaults = function() {
    return {
        'populate': '_friends',
        'limit': 10,
        'offset': 0
    };
};

UserSchema.statics.creationValidation = {
    login: { type : regexps.login, required: true },
    email: { type : regexps.email, required: true },
    firstname: { type : regexps.name, required: false },
    lastname: { type : regexps.name, required: false },
    gender: { type : regexps.gender, required: true },
    lang: { type : regexps.lang, required: true },
    password: { type : String, required: true },
    birthday: { type: Date, required: false }
};

UserSchema.statics.modificationValidation = {
    email: { type : regexps.email, required: false },
    firstname: { type : regexps.name, required: false },
    lastname: { type : regexps.name, required: false },
    gender: { type : regexps.gender, required: false },
    password: { type : String, required: false },
    birthday: { type: Date, required: false }
};

UserSchema.statics.findByLogin = function(login, req, res, next) {
    return new LifeQuery(this, req, res, next, {login: login});
};

UserSchema.statics.findByCredentials = function(login, password, req, res,
    next) {
    return new LifeQuery(this, req, res, next,
        {login: login, password: password});
};

UserSchema.statics.findFriends = function(user_id, req, res, next) {
    return new LifeQuery(this, req, res, next, {_friends: user_id});
};

var User = mongoose.model('User', UserSchema);

module.exports = User;