var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Picture = mongoose.model('Picture'),
    LifeConfig = require('../wrappers/LifeConfig.js'),
    LifeQuery = require('../wrappers/LifeQuery.js'),
    LifeData = require('../wrappers/LifeData.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    element = require('./Element.js'),
    bcrypt = require('bcryptjs'),
    crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    login: { type : String, match: new LifeConstraints.LoginRegexp().regexp(), required: true, unique: true},
    email: { type : String, match: new LifeConstraints.Email().regexp(), required: true, unique: true},
    firstname: { type : String, required: false},
    lastname: { type : String, required: false},
    gender: { type : String, match: new LifeConstraints.GenderEnum().regexp(), required: true,
        'default': 'undefined'},
    lang: { type : String, match: new LifeConstraints.Locale().regexp(), required: true},
    birthday: { type: Date, required: false },
    avatar: {type: ObjectId, required: false, ref: 'Picture'},
    _password: { type : String, required: true },
    _achievements: [{type: ObjectId, required: false, ref: 'Achievement'}],
    _friends: [{type: ObjectId, required: false, ref: 'User'}]
}, { autoIndex: true });

UserSchema.plugin(element);

UserSchema.virtual('password').set(function (value) {
    this._password = value;
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

UserSchema.methods.jsonAddon = function (req, res, level, doc, cb) {
    if (this.birthday) {
        doc.birthday = LifeData.dateToString(this.birthday);
    }

    if (req.user) {
        doc.is_friend = this._friends.reduce(function (prev, curr) {
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
        var gravatar_url = crypto
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

UserSchema.post('remove', function (doc) {
    var Friendship = require('./Friendship.js'),
        Conversation = require('./Conversation.js');

    new LifeQuery(Friendship)
        .findByLogin(doc.login)
        .remove();

    new LifeQuery(Conversation)
        .findByUser(doc.login)
        .remove();
});

UserSchema.statics.queryDefaults = function () {
    return {
        'populate': '_achievements _friends avatar',
        'limit': 10,
        'index': 0
    };
};

UserSchema.statics.queries.findByLogin = function (login) {
    var params = [];

    if (LifeData.isObjectId(login)) {
        params = {_id: login};
    } else {
        params = {login: login};
    }

    return this.and(params);
};

UserSchema.statics.queries.findFriends = function (user_id) {
    return this.and({_friends: user_id});
};

UserSchema.statics.queries.term = function (term) {
    var query = this;

    if (term !== undefined && term !== null) {
        term.split(/\s/).forEach(function (term) {
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

UserSchema.statics.creationValidation = [
    new LifeConstraints.LoginRegexp('login'),
    new LifeConstraints.Email('email'),
    new LifeConstraints.String('firstname', false),
    new LifeConstraints.String('lastname', false),
    new LifeConstraints.GenderEnum('gender', false).fallback('undefined'), // default 'undefined'
    new LifeConstraints.Locale('lang'),
    new LifeConstraints.Password(8, 'password'),
    new LifeConstraints.Date('birthday', false),
    new LifeConstraints.Image('avatar', false)
];

UserSchema.statics.modificationValidation = [
    new LifeConstraints.Email('email'),
    new LifeConstraints.String('firstname', false),
    new LifeConstraints.String('lastname', false),
    new LifeConstraints.GenderEnum('gender', false).fallback('undefined'), // default 'undefined'
    new LifeConstraints.Locale('lang'),
    new LifeConstraints.Password(8, 'password'),
    new LifeConstraints.Date('birthday', false),
    new LifeConstraints.Image('avatar', false)
];

var User = mongoose.model('User', UserSchema);

module.exports = User;
