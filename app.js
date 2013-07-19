var application_root = __dirname;
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
require('./wrappers/LifeInit.js');
var LifeRouter = require('./wrappers/LifeRouter.js');
var LifeConfig = require('./wrappers/LifeConfig.js');
var CorsMiddleware = require('./middlewares/cors.js');

mongoose.connect(LifeConfig['db_path']);

var app = express();

app.configure(function () {
  app.use(express.bodyParser({'uploadDir': LifeConfig.tmp_uploaded}));
  app.use(express.methodOverride());
  app.use(express.static(path.join(application_root, LifeConfig.public_path)));
  app.use(CorsMiddleware.allowCrossDomain(LifeConfig.allowed_cors_domain));
  app.use(app.router);

  if (LifeConfig['dev']) {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  }
});

app.get(['/', '/api'], function (req, res) {
  res.send('Life API is alive! <a href="/apitest.html">API Console</a>');
});

var router = new LifeRouter(app);
router.init();

// Launch server
console.log('Listening on port ' + LifeConfig.port + '...');
app.listen(LifeConfig.port);