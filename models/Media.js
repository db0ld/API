var mongoose = require('mongoose'),
    element = require('./Element.js');

var Media = new mongoose.Schema({
    owner: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    picture: {type : mongoose.Schema.Types.ObjectId, ref: 'Picture', required: false },
    type: {type : String, required: true }
});

Media.plugin(element);

module.exports = mongoose.model('Media', Media);