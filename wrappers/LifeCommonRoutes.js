var api_utils = require('../utils/api.js');
var LifeQuery = require('../wrappers/LifeQuery.js');

var LifeCommonRoutes = function(app, model) {
    this.app = app;
    this.model = model;
};

LifeCommonRoutes.prototype.update = function(route) {
    this.app.put(route, function (req, res){
        return LifeQuery.findById(this.model, req.params.id, function(err, item) {
            item = api_utils.requestToObject(req, this.model, item);

            LifeQuery.save(item, function(err, item) {
                return api_utils.apiResponse(res, req, item);
            });
        });
    });
};

LifeCommonRoutes.prototype.findOne = function(route) {
    this.app.get(route, function (req, res) {
        return LifeQuery.findById(this.model, req.params.id, function(err, item) {
            return api_utils.apiResponse(res, req, item);
        });
    });
};

LifeCommonRoutes.prototype.addOne = function(route) {
    this.app.post(route, function (req, res) {
        var item = new this.model(api_utils.requestToObject(req, this.model));

        LifeQuery.save(item, function(err, item) {
            api_utils.apiResponse(res, req, item);
        });
    });
};


module.exports = LifeCommonRoutes;