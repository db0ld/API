var application_root = __dirname;
var mongoose = require('mongoose');
var models = require('./models.js');
var express = require("express");
var api_params = require('./config.js');
var path = require("path");

mongoose.connect(api_params['db_path']);

var app = express();

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(application_root, api_params['public_path'])));
  app.use(app.router);

  if (api_params['dev']) {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  }
});

app.get(['/', '/api'], function (req, res) {
  res.send('Life API is alive! <a href="apitest.html">API Console is here</a>');
});

var controllers = require('./controller.js')(app, models);

// Launch server
console.log('Listening on port ' + api_params.port + '...');
app.listen(api_params.port);