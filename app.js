var application_root = __dirname,
    express = require('express'),
    path = require('path'),
    LifeRouter = require('./wrappers/LifeRouter.js'),
    LifeSequelize = require('./wrappers/LifeSequelize.js'),
    LifeConfig = require('./wrappers/LifeConfig.js');

var app = express();

app.configure(function () {
    app.engine('html', require('ejs').renderFile);
    app.use(express.bodyParser({'uploadDir': LifeConfig.tmp_uploaded}));
    app.use(express.methodOverride());
    app.use(express['static'](path.join(application_root, LifeConfig.public_path)));
    app.use(app.router);

    if (LifeConfig.dev) {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    }
});

app.get(['/', '/api'], function (req, res) {
    res.send('Life API is alive! <a href="/apitest.html">API Console</a> ' +
        '<a href="/doc/v1">Documentation</a>');
});

new LifeSequelize.setup(__dirname + '/models');

var router = new LifeRouter(app);
router.init();

// Launch server
console.log('Listening on port ' + LifeConfig.port + '...');
app.listen(LifeConfig.port, '::');