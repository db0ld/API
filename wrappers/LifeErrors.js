/**
 * A class listing all errors returned by the API
 *
 * @class LifeErrors
 * @constructor
 */
var LifeErrors = function () {

};

/**
 * The requested document was not found
 * @inner
 */
LifeErrors.NotFound = {
    'code': 404,
    'type': 'NotFound',
    'message': 'The requested document was not found',
    'http': 404
};

/**
 * The requested method was not found
 * @inner
 */
LifeErrors.MethodNotFound = {
    'code': 404,
    'type': 'MethodNotFound',
    'message': 'The requested method was not found',
    'http': 404
};

/**
 * An unique result was expected, several found
 * @inner
 */
LifeErrors.NonUniqueResult = {
    'code': 400,
    'type': 'NonUniqueResult',
    'message': 'An unique result was expected, several found',
    'http': 406
};

/**
 * The provided external authentification is already used
 * @inner
 */
LifeErrors.UserExtTokenAlreadyRegistered = {
    'code': 1100,
    'type': 'UserExtTokenAlreadyRegistered',
    'message': 'The provided external authentification is already used',
    'http': 400
};

/**
 * An error happened while reading from or writing to the database
 * @inner
 */
LifeErrors.IOErrorDB = {
    'code': 9000,
    'type': 'IOErrorDB',
    'message': 'An error happened while reading from or writing to the database',
    'http': 400
};

/**
 * Authentication is required for this resource
 * @inner
 */
LifeErrors.AuthenticationRequired = {
    'code': 6000,
    'type': 'AuthenticationRequired',
    'message': 'Authentication is required for this resource',
    'http': 401
};

/**
 * One or serveral parameters are missing or invalid
 * @inner
 */
LifeErrors.InvalidParameters = {
    'code': 4000,
    'type': 'InvalidParameters',
    'message': 'One or serveral parameters are missing or invalid',
    'http': 400
};

/**
 * Authentication has failed
 * @inner
 */
LifeErrors.AuthenticationError = {
    'code': 6000,
    'type': 'AuthenticationError',
    'message': 'Authentication has failed',
    'http': 401
};

/**
 * The required role for this method is missing
 * @inner
 */
LifeErrors.AuthenticationMissingRole = {
    'code': 6020,
    'type': 'AuthenticationMissingRole',
    'message': 'The required role for this method is missing',
    'http': 401
};

/**
 * No language specified
 * @inner
 */
LifeErrors.NoLanguageSpecified = {
    'code': 6500,
    'type': 'NoLanguageSpecified',
    'message': 'No language specified',
    'http': 400
};

/**
 * Nothing has been changed whilst it was expected
 * @inner
 */
LifeErrors.NothingHasChanged = {
    'code': 665,
    'type': 'NothingHasChanged',
    'message': 'Nothing has been changed',
    'http': 409
};

/**
 * User logic error
 * @inner
 */
LifeErrors.UserLogicError = {
    'code': 664,
    'type': 'UserLogicError',
    'message': 'User logic error',
    'http': 418
};

/**
 * Not Implemented
 * @inner
 */
LifeErrors.NotImplemented = {
    'code': 9999,
    'type': 'NotImplemented',
    'message': 'Not Implemented',
    'http': 501
};

/**
 * Not Implemented
 * @inner
 */
LifeErrors.UploadError = {
    'code': 4978,
    'type': 'UploadError',
    'message': 'An error occured while uploading some file',
    'http': 500
};

/**
 * Not Implemented
 * @inner
 */
LifeErrors.UploadMissingFile = {
    'code': 4979,
    'type': 'UploadMissingFile',
    'message': 'A required file is missing',
    'http': 500
};

module.exports = LifeErrors;