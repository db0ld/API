var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var OAuthIdentitySchema = require('mongoose').model('OAuthIdentity').schema;
var OAuthTokenSchema = require('mongoose').model('OAuthToken').schema;
var LifeConfig = require('../wrappers/LifeConfig.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

var UserSchema = new mongoose.Schema({
    login: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true, unique: true},
    firstname: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    lastname: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: false},
    gender: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    locale: { type : String, match: /^[a-z]{2}(_[A-Z]{2})?$/, required: true},
    password: { type : String, required: true},
    birthdate: { type: Date, required: true },
    account_creation : { type : Date, 'default' : Date.now },
    achievements: [{type: ObjectId, required: false}],
    ext_oauth_identities: {type: [OAuthIdentitySchema]},
    oauth_tokens: {type: [OAuthTokenSchema]}
}, { autoIndex: true });

UserSchema.virtual('name').get(function () {
  return this.firstname + ' ' + this.lastname;
});

UserSchema.virtual('profile_url').get(function () {
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
        //delete obj.ext_oauth_identities;
        //delete obj.oauth_tokens;
        delete obj.id;
        delete obj._id;
        delete obj.__v;

        return obj;
    }
};

UserSchema.statics.findByExtOAuth = function(provider, ext_id, req, res, next) {
    return new LifeQuery(this.find(), req, res, next)
      .filterEquals('ext_oauth_identities.provider', provider)
      .filterEquals('ext_oauth_identities.ext_id', ext_id);
};

UserSchema.statics.findByLogin = function(login, req, res, next) {
    return new LifeQuery(this.find(), req, res, next)
      .filterEquals('login', login);
};

UserSchema.statics.findByOauthToken = function(token, req, res, next) {
    return new LifeQuery(this.find(), req, res, next)
      .filterEquals('oauth_tokens.token', token);
};

//return console.log(user.oauth_tokens.children);

UserSchema.statics.findByCredentials = function(login, password, req, res, next) {
    return new LifeQuery(this.find(), req, res, next)
      .filterEquals('login', login)
      .filterEquals('password', password);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;