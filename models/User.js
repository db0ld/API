var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Picture = mongoose.model('Picture'),
    LifeConfig = require('../wrappers/LifeConfig.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    regexps = LifeData.regexps,
    LifeUpload = require('../wrappers/LifeUpload.js'),
    element = require('./Element.js'),
    bcrypt = require('bcryptjs'),
    crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    login: { type : String, match: regexps.login, required: true, unique: true},
    email: { type : String, match: regexps.email.regexp(), required: true, unique: true},
    firstname: { type : String, match: regexps.name, required: false},
    lastname: { type : String, match: regexps.name, required: false},
    gender: { type : String, match: regexps.gender.regexp(), required: true,
        'default': 'undefined'},
    lang: { type : String, match: regexps.lang, required: true},
    birthday: { type: Date, required: false },
    avatar: {type: ObjectId, required: false, ref: 'Picture'},
    _password: { type : String, required: true },
    _achievements: [{type: ObjectId, required: false, ref: 'Achievement'}],
    _friends: [{type: ObjectId, required: false, ref: 'User'}]
}, { autoIndex: true });

UserSchema.plugin(element);

UserSchema.virtual('password').set(function (value) {
    this._password = bcrypt.hashSync(value, 8);
});

UserSchema.virtual('password').get(function (value) {
    return this._password;
});

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

UserSchema.methods.jsonAddon = function(req, res, level, doc, cb) {
    if (this.birthday) {
        doc.birthday = LifeData.dateToString(this.birthday);
    }

    if (req.user) {
        doc.is_friend = this._friends.reduce(function(prev, curr) {
            if (prev === true) {
                return prev;
            }

            return curr === req.user.id ||
                curr.id === req.user.id;
        }, false);
    }

    if (!req.user || req.user.id !== this.id) {
        delete doc.email;
    }

    delete doc.password;

    // Gravatar to be deleted someday
    if (!this.avatar) {
        var gravatar_url = require('crypto')
            .createHash('md5')
            .update(this.email.trim().toLowerCase())
            .digest('hex');

        gravatar_url = 'http://www.gravatar.com/avatar/' + gravatar_url;

        doc.avatar = {
            modification: LifeData.dateTimeToString(new Date()),
            title: "untitled",
            creation: LifeData.dateTimeToString(new Date()),
            url_big: gravatar_url,
            url_small: gravatar_url,
            url: gravatar_url,
            id: "000000000000000000000000"
        };
    }

    return cb(doc);
};

UserSchema.statics.queryDefaults = function() {
    return {
        'populate': '_achievements _friends avatar',
        'limit': 10,
        'index': 0
    };
};

UserSchema.statics.creationValidation = {
    login: { type : regexps.login, required: true },
    email: { type : regexps.email, required: true },
    firstname: { type : regexps.name, required: false },
    lastname: { type : regexps.name, required: false },
    gender: { type : regexps.gender, required: false, 'default': 'undefined' },
    lang: { type : regexps.lang, required: true },
    password: { type : String, required: true },
    birthday: { type: Date, required: false },
    avatar: { type: LifeUpload.Avatar, required: false }
};

UserSchema.statics.modificationValidation = {
    email: { type : regexps.email, required: false },
    firstname: { type : regexps.name, required: false },
    lastname: { type : regexps.name, required: false },
    gender: { type : regexps.gender, required: false },
    password: { type : String, required: false },
    birthday: { type: Date, required: false },
    avatar: { type: LifeUpload.Avatar, required: false }
};

UserSchema.statics.findByLogin = function(login, req, res, next) {
    var params = [];

    if (LifeData.isObjectId(login)) {
        params = {_id: login};
    } else {
        params = {login: login};
    }

    return new LifeQuery(mongoose.model('User'), req, res, next, params);
};

UserSchema.statics.findFriends = function(user_id, req, res, next) {
    return new LifeQuery(this, req, res, next, {_friends: user_id});
};

UserSchema.statics.term = function(query, term) {
    if (typeof term != "undefined" && term !== null) {
        term.split(/\s/).forEach(function(term) {
            var re = new RegExp(LifeData.regexpEscape(term), 'i');
            query.and({$or: [
                { 'firstname': { $regex: re }},
                { 'lastname': { $regex: re }},
                { 'email': term },
                { 'login': { $regex: re }}
            ]});
        });
    }

    return query;
};

UserSchema.post('remove', function(doc) {
    var Friendship = require('./Friendship.js');
    var Conversation = require('./Conversation.js');

    new LifeQuery(Friendship, null, null, function(err) {})
        .modelStatic('findByLogin', doc.login)
        .remove();

    new LifeQuery(Conversation, null, null, function(err) {})
        .modelStatic('findByUser', doc.login)
        .remove();
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
