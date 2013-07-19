
//CORS middleware
var allowCrossDomain = function(domain) {
    return function(req, res, next) {
    
	res.header('Access-Control-Allow-Origin', domain);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	
	next();
    }
}

module.exports = {
    'allowCrossDomain': allowCrossDomain
}