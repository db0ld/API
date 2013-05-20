var mongoose = require('mongoose');

var I18nStringSchema = new mongoose.Schema({
    isoCode: {type: String, required: true},
    value: {type: String, required: true}
});

I18nStringSchema.statics.queryDefaults = function() {
    return {
        'populate': '',
        'limit': 10,
        'offset': 0
    };
};

var I18nString = mongoose.model('I18nString', I18nStringSchema);

module.exports = I18nString;