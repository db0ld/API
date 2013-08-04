var Errors = {};

Errors.NotANumber = {
    'code': 1001,
    'type': 'NotANumber',
    'message': 'Not a number'
};

Errors.MissingParameter = {
    'code': 1000,
    'type': 'MissingParameter',
    'message': 'MissingParameter'
};

Errors.EmptyString = {
    'code': 1002,
    'type': 'EmptyString',
    'message': 'EmptyString'
};

Errors.InvalidDate = {
    'code': 1003,
    'type': 'InvalidDate',
    'message': 'InvalidDate'
};

Errors.BadFormat = {
    'code': 1004,
    'type': 'BadFormat',
    'message': 'BadFormat'
};

Errors.RequiredFileNotFound = {
    'code': 1005,
    'type': 'RequiredFileNotFound',
    'message': 'RequiredFileNotFound'
};

Errors.TooShort = {
    'code': 1006,
    'type': 'TooShort',
    'message': 'TooShort'
};

Errors.TooLong = {
    'code': 1007,
    'type': 'TooLong',
    'message': 'TooLong'
};

Errors.NotFound = {
    'code': 1008,
    'type': 'TooLong',
    'message': 'TooLong'
};

module.exports = Errors;