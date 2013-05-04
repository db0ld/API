var api_utils = require('../utils/api.js');
var LifeCommonRoutes = require('../wrappers/LifeCommonRoutes.js');
var LifeQuery = require('../wrappers/LifeQuery.js');


module.exports = function(app, models) {
    var routeBase = 'achievements';
    var commonRoutes = new LifeCommonRoutes(app, models.Achievement);

    commonRoutes.addOne(routeBase);
    commonRoutes.update(routeBase + '/:id');
    commonRoutes.findOne(routeBase + '/:id');

    // get all achievements
    app.get(routeBase, function (req, res, next) {
        var query = LifeQuery.fromModel(models.Achievement, req, res, next);

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
            return api_utils.apiPaginatedResponse(res, req, data);
          });
    });
};