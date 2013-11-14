var mongoose = require('mongoose'),
    element = require('./Element.js');

var Activity = new mongoose.Schema({
    owner: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {type : String, required: true },
    template: {type : String, required: true },
    users: [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
    achievement_statuses: [{type : mongoose.Schema.Types.ObjectId, ref: 'AchievementStatus'}],
    //medias: [{type : mongoose.Schema.Types.ObjectId, ref: 'Media'}],
    //news: [{type : mongoose.Schema.Types.ObjectId, ref: 'News'}],
});

Activity.plugin(element);

Activity.statics.queryDefaults.populate = 'owner users achievement_statuses';

var templates = {
    network_addition: "@[owner] added @[user.0] to its game network",
    achievement_unlocked: "@[owner] earned a new achievement: @[achievement_statuses.0]!",
    new_objective: "@[owner] has a new objective: @[achievement_statuses.0]",
};

Activity.statics.queries.findByOwner = function (user_id) {
    this._query.and({owner: user_id});

    return this;
};

Activity.statics.queries.findByOwners = function (user_ids) {
    this._query.and({owner: {$in: user_ids}});

    return this;
};

Activity.statics.add =  function (owner, type, params, template) {
    var User = require('mongoose').model('User');
    var Activity = require('mongoose').model('Activity');
    var activity = new Activity();

    activity.owner = owner;
    activity.type = type;

    ['users', 'achievement_statuses'].forEach(function (param) {
        if (params[param] !== undefined) {
            activity[param] = params[param];
        }
    });

    if (template === undefined && templates[type] !== undefined) {
        activity.template = templates[type];
    } else {
        activity.template = template;
    }

    activity.save(function (err) {
        if (err) {
            console.error(['Async activity add error', err]);
            console.error(err.errors);
        }
    });
};

module.exports = mongoose.model('Activity', Activity);