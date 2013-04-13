var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = new mongoose.Schema({
	name: { type : String, match: /^[a-zA-Z0-9-_]+$/, required: true},
    age : { type : Number, min : 0, max : 100, required: true},
	account_creation : { type : Date, default : Date.now},
	achievements: [{type: ObjectId, required: false}]
	// objectives: [{type: ObjectId, required: false}]
});

var User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.User = User;