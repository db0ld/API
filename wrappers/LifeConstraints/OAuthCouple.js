var And = require('./And.js');
var OAuthSupported = require('./OAuthSupported.js');
var OAuthToken = require('./OAuthToken.js');

module.exports = And.bind(null, [
    new OAuthSupported('site_name', false),
    new OAuthToken('site_token', 'site_name', false)
]);