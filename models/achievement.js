var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var i18nString = require('./i18nString.js');

var achievementSchema = new mongoose.Schema({
	name: [i18nString.i18nStringSchema],
	description: [i18nString.i18nStringSchema],
	achievements: [{type: ObjectId, required: false}]
});

var Achievement = mongoose.model('Achievement', achievementSchema);

exports.achievementSchema = achievementSchema;
exports.Achievement = Achievement;