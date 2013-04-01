var mongoose = require('mongoose');

var i18nStringSchema = new mongoose.Schema({
	isoCode: {type: String, required: true},
	value: {type: String, required: true}
});

var I18nString = mongoose.model('I18nString', i18nStringSchema);

exports.i18nStringSchema = i18nStringSchema;
exports.I18nString = I18nString;