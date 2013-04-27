var api_utils = require('../utils/api.js');
var LifeCommonRoutes = require('../wrappers/LifeCommonRoutes.js');
var LifeQuery = require('../wrappers/LifeQuery.js');


module.exports = function(app, models) {
    var commonRoutes = new LifeCommonRoutes(app, models.Achievement);

    commonRoutes.addOne('achievements');
    commonRoutes.update('achievements/:id');
    commonRoutes.findOne('achievements/:id');

    // get all achievements
    app.get('achievements', function (req, res) {
        var query = LifeQuery.fromModel(models.Achievement, req, res);

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