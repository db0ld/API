module.exports = {
  Success: {
    'code': 0,
	'type': 'Success',
    'message': 'Success'
  },

  // 1000: User errors
  UserNotFound: {
    'code': 1000,
    'type': 'UserNotFound',
    'message': 'This user was not found'
  },

  UserExtTokenAlreadyRegistered: {
    'code': 1100,
    'type': 'UserExtTokenAlreadyRegistered',
    'message': 'This external authentification is already used'
  },

  AchievementNotFound: {
    'code': 1500,
    'type': 'AchievementNotFound',
    'message': 'This user was not found'
  },


  IOErrorDB: {
    'code': 9000,
    'type': 'IOErrorDB',
    'message': 'An error happened while reading from or writing to the database'
  }

};
