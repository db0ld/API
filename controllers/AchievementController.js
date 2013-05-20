var Achievement = require('mongoose').model('Achievement');
var I18nString = require('mongoose').model('I18nString');
var LifeErrors = require('../wrappers/LifeErrors.js');
var LifeQuery = require('../wrappers/LifeQuery.js');
var LifeData = require('../wrappers/LifeData.js');
var LifeResponse = require('../wrappers/LifeResponse.js');

module.exports = function(app) {
    var routeBase = 'achievements';

    // add a single achievement
    app.post(routeBase, function (req, res, next) {
        var achievement = new Achievement();

        achievement.name = new I18nString({
          string: req.body.name,
          locale: req.locale
        });

        if (typeof req.body.description == 'string') {
          achievement.description = new I18nString({
            string: req.body.description,
            locale: req.locale
          });
        }

        return new LifeData(Achievement, req, res, next).save(achievement);
    });

    // get a single achievement
    app.get(routeBase + "/:id", function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id);
    });

    // update a single achievement
    app.put(routeBase + "/:id", function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).findById(req.params.id, function(achievement) {
            return new LifeData(Achievement, req, res, next).saveFromRequest(achievement);
        });
    });

    // get all achievements
    app.get(routeBase, function (req, res, next) {
        return new LifeQuery(Achievement, req, res, next).exec();
    });
};