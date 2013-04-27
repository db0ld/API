var fs = require('fs');
var LifeRouter = require('./wrappers/LifeRouter.js');

module.exports = function(app, models) {
	app = new LifeRouter(app);

	// blocking readdir, never mind, only launched at app initialization
	fs.readdirSync('./controllers').forEach(function(file) {
		if (file.match(/\.js$/)) {
			require('./controllers/' + file)(app, models);
		}
	});
};