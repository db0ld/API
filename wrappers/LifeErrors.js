var LifeErrors = function() {

};

LifeErrors.NotFound = {
  'code': 404,
  'type': 'NotFound',
  'message': 'NotFound',
  'http': 404
};

LifeErrors.NonUniqueResult = {
  'code': 400,
  'type': 'NonUniqueResult',
  'message': 'Non unique result',
  'http': 406
};

LifeErrors.UserExtTokenAlreadyRegistered = {
  'code': 1100,
  'type': 'UserExtTokenAlreadyRegistered',
  'message': 'This external authentification is already used',
  'http': 400
};

LifeErrors.IOErrorDB = {
  'code': 9000,
  'type': 'IOErrorDB',
  'message': 'An error happened while reading from or writing to the database',
  'http': 400
};

LifeErrors.AuthenticationRequired = {
  'code': 6000,
  'type': 'AuthenticationRequired',
  'message': 'Authentication is required for this resource',
  'http': 401
};

LifeErrors.AuthenticationError = {
  'code': 6010,
  'type': 'AuthenticationError',
  'message': 'Authentication error',
  'http': 403
};

LifeErrors.AuthenticationMissingRole = {
  'code': 6020,
  'type': 'AuthenticationMissingRole',
  'message': 'Authentication missing role',
  'http': 401
};

LifeErrors.NoLanguageSpecified = {
  'code': 6500,
  'type': 'NoLanguageSpecified',
  'message': 'No language specified',
  'http': 400
};

LifeErrors.UserLogicError = {
  'code': 664,
  'type': 'UserLogicError',
  'message': 'User logic error',
  'http': 418
};

LifeErrors.NotImplemented = {
  'code': 9999,
  'type': 'NotImplemented',
  'message': 'Not Implemented',
  'http': 501
};

module.exports = LifeErrors;