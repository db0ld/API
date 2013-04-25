var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var oAuthIdentity = require('./oAuthIdentity.js');
var oAuthToken = require('./oAuthToken.js');
var api_params = require('../config.js');

var userSchema = new mongoose.Schema({
    login: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true, unique: true},
    firstname: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    lastname: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: false},
    gender: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    birthdate: { type: Date, required: true },
    account_creation : { type : Date, 'default' : Date.now },
    achievements: [{type: ObjectId, required: false}],
    ext_oauth_identities: [oAuthIdentity.oAuthIdentitySchema],
    oauth_tokens: [oAuthIdentity.oAuthTokenSchema]
}, { autoIndex: true });

userSchema.virtual('name').get(function () {
  return this.firstname + ' ' + this.lastname;
});

userSchema.virtual('profile_url').get(function () {
  return api_params.website_url + 'user/' + this.login.toLowerCase();
});

userSchema.set('toJSON', { getters: true, virtuals: true, tranform: true });


userSchema.options.toJSON = {
    transform: function(doc, ret, options) {

        obj = doc.toObject();
        delete obj.ext_oauth_identities;
        delete obj.oauth_tokens;
        return obj;
    }
};

var User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.User = User;