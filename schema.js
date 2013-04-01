[
	"i18nString",
	"achievement"
]
	.forEach(function(sourceFile) {
		var mod_exp = require("./schemas/" + sourceFile + ".js");

		for (var key in mod_exp) {
			exports[key] = mod_exp[key];
		}
	});
