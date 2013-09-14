var LifeResponse = require('./LifeResponse.js');

var LifeHttpResponse = function (context) {
    this.context = context;
};

var addCorsHeaders = function (context) {
    context.send.header('Access-Control-Allow-Origin', '*');
    context.send.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    context.send.header('Access-Control-Allow-Headers', 'Content-Type');
};

LifeHttpResponse.prototype.header = function (name, value) {
    this.context._res.header(name, value);

    return this;
};

LifeHttpResponse.prototype.single = function (data) {
    return new LifeResponse(this.context).single(data);
};

LifeHttpResponse.prototype.list = function (data, size, query) {
    return new LifeResponse(this.context).list(data, size, query);
};

LifeHttpResponse.prototype.error = function (error) {
    return new LifeResponse(this.context).error(error);
};

LifeHttpResponse.prototype.render = function (template, data) {
    return this.context._res.render(template, data);
};

LifeHttpResponse.prototype.json = function (httpCode, data) {
    addCorsHeaders(this.context);

    this.context._res.json(httpCode, data);
};

LifeHttpResponse.prototype.jsonp = function (httpCode, data) {
    addCorsHeaders(this.context);

    this.context._res.jsonp(httpCode, data);
};

module.exports = LifeHttpResponse;