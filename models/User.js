var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var LifeConfig = require('../wrappers/LifeConfig.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

var UserSchema = new mongoose.Schema({
    login: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true, unique: true},
    firstname: { type : String, match: /^[a-zA-Z0-9-._ ]+$/, required: true},
    lastname: { type : String, match: /^[a-zA-Z0-9-._ ]+$/, required: false},
    gender: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    locale: { type : String, match: /^[a-z]{2}(_[A-Z]{2})?$/, required: true},
    password: { type : String, required: true, select: false},
    birthdate: { type: Date, required: true },
    account_creation : { type : Date, 'default' : Date.now },
    achievements: [{type: ObjectId, required: false, ref: 'Achievement'}],
    friends: [{type: ObjectId, required: false, ref: 'User'}]
}, { autoIndex: true });

UserSchema.virtual('name').get(function () {
  var name = this.firstname;

  if (typeof this.lastname === 'string') {
    name = name + ' ' + this.lastname;
  }

  return name;
});

UserSchema.virtual('profile_url').get(function () {
  return LifeConfig.website_url + 'user/' + this.login.toLowerCase();
});

UserSchema.statics.queryDefaults = function() {
    return {
        'populate': 'friends',
        'limit': 10,
        'offset': 0
    };
};

UserSchema.statics.findByExtOAuth = function(provider, ext_id, req, res, next) {
    return new LifeQuery(this, req, res, next)
      .filterEquals('ext_oauth_identities.provider', provider)
      .filterEquals('ext_oauth_identities.ext_id', ext_id);
};

UserSchema.statics.findByLogin = function(login, req, res, next) {
    return new LifeQuery(this, req, res, next, {login: login});
};

UserSchema.statics.findByCredentials = function(login, password, req, res, next) {
    return new LifeQuery(this, req, res, next, {login: login, password: password});
};

UserSchema.statics.findFriends = function(user_id, req, res, next) {
    return new LifeQuery(this, req, res, next, {friends: user_id});
};

var User = mongoose.model('User', UserSchema);

module.exports = User;