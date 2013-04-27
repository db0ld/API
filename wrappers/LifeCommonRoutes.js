var api_utils = require('../utils/api.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

var LifeCommonRoutes = function(app, model) {
    this.app = app;
    this.model = model;
};

LifeCommonRoutes.prototype.update = function(route) {
    var that = this;

    that.app.put(route, function (req, res, next){
        return LifeQuery.findById(that.model, req.params.id, function(err, item) {
            item = api_utils.requestToObject(req, that.model, item);

            LifeQuery.save(item, function(err, item) {
                return api_utils.apiResponse(res, req, item);
            }, next);
        }, next);
    });
};

LifeCommonRoutes.prototype.findOne = function(route) {
    var that = this;

    that.app.get(route, function (req, res, next) {
        return LifeQuery.findById(that.model, req.params.id, function(err, item) {
            return api_utils.apiResponse(res, req, item);
        }, next);
    });
};

LifeCommonRoutes.prototype.addOne = function(route) {
    var that = this;

    that.app.post(route, function (req, res, next) {
        var item = new that.model(api_utils.requestToObject(req, that.model));

        LifeQuery.save(item, function(err, item) {
            api_utils.apiResponse(res, req, item);
        }, next);
    });
};


module.exports = LifeCommonRoutes;