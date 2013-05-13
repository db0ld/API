var Achievement = require('mongoose').model('Achievement');
var LifeResponse = require('../wrappers/LifeResponse.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

module.exports = function(app) {
    var routeBase = 'achievements';

    // get all achievements
    app.get(routeBase, function (req, res, next) {
        var query = LifeQuery.fromModel(Achievement, req, res, next);

        if (req.query.name) {
          query.filterRegexp('name.value', new RegExp(req.query.name, 'i'));
          query.filterEquals('name.isoCode', req.query.locale);
        }

        if (req.query.description) {
          query.filterRegexp('description.value', new RegExp(req.query.name, 'i'));
          query.filterEquals('description.isoCode', req.query.locale);
        }

        return query.paginate()
          .exec(function(err, data) {
            return LifeResponse.sendList(req, res, data);
          });
    });
};