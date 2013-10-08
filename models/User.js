var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    element = require('./Element.js'),
    LifeConstraints = require('../wrappers/LifeConstraints.js'),
    LifeData = require('../wrappers/LifeData.js'),
    Gender = LifeConstraints.Gender,
    Email = LifeConstraints.Email
    OAuthSupported = LifeConstraints.OAuthSupported;

var User = new mongoose.Schema({
    login: {type: String, required: true, index: {unique: true}},
    firstname: {type: String, required: false},
    lastname: {type: String, required: false},
    _password: {type: String, required: false},
    birthday: {type: Date, required: false},
    //avatar: {type: ObjectId, required: false, ref: 'Picture'},
    gender: {type: String, match: new Gender().regexp(),
            required: true, default: 'undefined'},
    email: {type: String, match: new Email().regexp(),
            required: true, index: {unique: true}},
    score: {type: Number, required: true, default: 0},
    _oauth: [{
        site: {type: String, match: new OAuthSupported().regexp(), required: true},
        user_id: {type: String, required: true}
    }]
});

User.plugin(element);

User.virtual('password').set(function (value) {
    this._password = value;
});

User.virtual('password').get(function (value) {
    return this._password;
});

User.virtual('level').get(function () {
    if (this.score <= 0) {
        return 0;
    }

    return Math.ceil(Math.log(this.score / 100) / Math.log(2)) + 1;
});

User.virtual('url').get(function () {
    return 'http://life.tl/u/' + this.login + '//';
});

User.virtual('name').get(function (value) {
    return [this.firstname, this.lastname]
        .filter(function (item) { return item; })
        .join() || this.login;
});

User.methods.jsonAddon = function (context, level, doc, cb) {
    if (this.birthday) {
        doc.birthday = LifeData.dateToString(this.birthday);
    }

    doc.in_game_network = false; // TODO
    doc.game_network_total = 0; // TODO
    doc.other_game_network_total = 0; // TODO

    if (!context.user() || context.user().id !== this.id) {
        delete doc.email;
    }

    delete doc.password;

    return cb(doc);
};

User.statics.queries.idOrLogin = function (id) {
    var filter = {$or: []};

    if (LifeData.isObjectId(id)) {
        filter.$or.push({_id: id});
    } else {
        filter.$or.push({login: id});
    }

    this._query.and(filter);

    return this;
};

User.statics.queries.loginOrEmail = function (login) {
    this._query.and({
        $or: [
            {email: login},
            {login: login}
        ]
    });

    return this;
};

User.statics.queries.searchByOAuthToken = function (site, id) {
    this._query.and({
        _oauth: {
            $elemMatch : {
                'site': site,
                'user_id': id
            }
        }
    });

    return this;
};

module.exports = mongoose.model('User', User);