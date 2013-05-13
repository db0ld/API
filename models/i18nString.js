var mongoose = require('mongoose');

var I18nStringSchema = new mongoose.Schema({
    isoCode: {type: String, required: true},
    value: {type: String, required: true}
});

var I18nString = mongoose.model('I18nString', I18nStringSchema);

module.exports = I18nString;