(function(module) {
	var Schema;
	var ObjectId;

	if (require) { // Server env
		console.log('Mongoose supported!');
		var mongoose = require('mongoose');

		Schema = mongoose.Schema;
		ObjectId = Schema.Types.ObjectId;
	} else { // browser env (ie. api console), faking mongoose
		console.log('Mongoose unsupported, let\'s faking it');

		var mongoose = {
			model: function(name, obj) {
				return obj;
			},
		};

		Schema = function(obj) {
			return obj;
		};

		ObjectId = 'ObjectId';
	}

	var schemas = {};

	var localeSchema = Schema({
		isoCode: {type: String, required: true, unique: true},
		englishName: {type: String, required: true, unique: true},
		localeName: {type: String, required: true},
	});

	var Locale = mongoose.model('Locale', localeSchema);
	Locale.routes = {
		'single': 'locale',
		'plural': 'locales',
	}

	var i18nStringSchema = Schema({
		isoCode: {type: String, required: true},
		value: {type: String, required: true},
	});

	var I18nString = mongoose.model('I18nString', i18nStringSchema);

	var achievementSchema = Schema({
		name: [I18nString],
		description: [I18nString],
		requirement: {type: ObjectId, required: false}, // parent achievement id
	});

	var Achievement = mongoose.model('Achievement', achievementSchema);

	var achievementCategorySchema = Schema({
		name: [I18nString],
		description: [I18nString],
		achievements: [Achievement],
		requirement: {type: ObjectId, required: false}, // parent achievement category id
	});

	var AchievementCategory = mongoose.model('AchievementCategory', achievementCategorySchema);
	AchievementCategory.routes = {
		'single': 'achievementCategory',
		'plural': 'achievementCategories',
	}

	module.exports = {
		Locale: Locale,
		I18nString: I18nString,
		Achievement: Achievement,
		AchievementCategory: AchievementCategory,
	};
}(module));
