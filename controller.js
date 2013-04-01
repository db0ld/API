var fs = require('fs');

module.exports = function(app, models) {
	// blocking readdir, never mind, only launched at app initialization
	fs.readdirSync('./controllers').forEach(function(file) {
		if (file.match(/\.js$/)) {
			require('./controllers/' + file)(app, models);
		}
	});
};