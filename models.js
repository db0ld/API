var fs = require('fs');

fs.readdirSync('./models').forEach(function(file) {
	if (file.match(/\.js$/)) {
		var mod_exp = require("./models/" + file);

		for (var key in mod_exp) {
			module.exports[key] = mod_exp[key];
		}
	}
});