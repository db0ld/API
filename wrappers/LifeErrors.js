var LifeErrors = function() {

};

LifeErrors.Success = {
  'code': 0,
  'type': 'Success',
  'message': 'Success'
};

LifeErrors.NotFound = {
  'code': 404,
  'type': 'NotFound',
  'message': 'NotFound'
};

LifeErrors.NotUnique = {
  'code': 400,
  'type': 'NotUnique',
  'message': 'NotUnique'
};

LifeErrors.UserNotFound = {
  'code': 1000,
  'type': 'UserNotFound',
  'message': 'This user was not found'
};

LifeErrors.UserExtTokenAlreadyRegistered = {
  'code': 1100,
  'type': 'UserExtTokenAlreadyRegistered',
  'message': 'This external authentification is already used'
};

LifeErrors.AchievementNotFound = {
  'code': 1500,
  'type': 'AchievementNotFound',
  'message': 'This user was not found'
};

LifeErrors.IOErrorDB = {
  'code': 9000,
  'type': 'IOErrorDB',
  'message': 'An error happened while reading from or writing to the database'
};

LifeErrors.AuthenticationRequired = {
  'code': 666,
  'type': 'AuthenticationRequired',
  'message': 'Authentication is required for this resource'
};

LifeErrors.NonUniqueResult = {
  'code': 667,
  'type': 'NonUniqueResult',
  'message': 'Non unique result'
};

module.exports = LifeErrors;