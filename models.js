[
	"i18nString",
	"achievement"
]
	.forEach(function(sourceFile) {
		var mod_exp = require("./models/" + sourceFile + ".js");

		for (var key in mod_exp) {
			module.exports[key] = mod_exp[key];
		}
	});
