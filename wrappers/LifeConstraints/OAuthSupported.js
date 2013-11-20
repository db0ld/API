var Enum = require('./Enum.js');
var LifeThirdParty = require('../LifeThirdParty.js');

var OAuthSupported = Enum.bind(null, Object.keys(LifeThirdParty));

module.exports = OAuthSupported;
