
//CORS middleware
var allowCrossDomain = function(domain) {
    return function(req, res, next) {

	res.header('Access-Control-Allow-Origin', domain);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method == 'OPTIONS') {
	    res.send(200);
	} else {
    	    next();
	}
    }
}

module.exports = {
    'allowCrossDomain': allowCrossDomain
}