(function(module) {
	var Schema;

	if (require) { // Server env
		console.log('Mangoose supported!');
		var mongoose = require('mongoose');

		Schema = mongoose.Schema;
	} else { // browser env, faking mangoose
		console.log('Mangoose unsupported, let\'s faking it');
		Schema = {
			Types: {
				ObjectId: 'ObjectId'
			}
		};
	}

	var schemas = {
	    'Media': {
	        'schema': {
	            path: { type: String, required: true },
	            type: { type: String, required: true, enum: ['image', 'video', 'audio', 'link'] },
	            createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'media',
	            'path_plural': 'medias',
	            'list': true,
	            'create': true,
	        },
	    },

	    'Locale': {
	        'schema': {
	            isoCode: { type: String, required: true, unique: true },
	            englishName: { type: String, required: true, unique: true },
	            localName: { type: String, required: true },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'locale',
	            'path_plural': 'locales',
	            'list': true,
	            'create': true,
	        },
	    },

	    'L10nString': {
	        'schema': {
	            locale: { type: Schema.Types.ObjectId, ref: 'Locale', required: true },
	            value: { type: String, required: true },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'l10nString',
	            'path_plural': 'l10nStrings',
	            'list': true,
	            'create': true,
	        },
	    },

	    'Comment': {
	        'schema': {
	            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	            responseTo: { type: Schema.Types.ObjectId, ref: 'Comment' },
	            value: { type: String, required: true },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'comment',
	            'path_plural': 'comments',
	            'list': true,
	            'create': true,
	        }
	    },

	    'Vote': {
	        'schema': {
	            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	            value: { type: Number, required: true },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'vote',
	            'path_plural': 'votes',
	            'list': true,
	            'create': true,
	        },
	    },

	    'Achievement': {
	        'schema': {
	            name: [{ type: Schema.Types.ObjectId, ref: 'L10nString', required: true }],
	            description: [{ type: Schema.Types.ObjectId, ref: 'L10nString', required: true }],
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'achievement',
	            'path_plural': 'achievements',
	            'list': true,
	            'create': true,
	        }
	    },

	    'AchievementCategory': {
	        'schema': {
	            achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement', required: true }],
	            name: [{ type: Schema.Types.ObjectId, ref: 'L10nString', required: true }],
	            description: [{ type: Schema.Types.ObjectId, ref: 'L10nString', required: true }],
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'achievementCategory',
	            'path_plural': 'achievementCategories',
	            'list': true,
	            'create': true,
	        },
	    },

	    'UserStatus': {
	        'schema': {
	            status: { type: String, required: true },
	            achievement: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
	            comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: true }],
	            votes: [{ type: Schema.Types.ObjectId, ref: 'Vote', required: true }],
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'userStatus',
	            'path_plural': 'userStatuses',
	            'list': true,
	            'create': true,
	        }
	    },

	    'User': {
	        'schema': {
	            login: { type: String, required: true, validate: [/[a-zA-Z][a-zA-Z0-9]/, 'validation.login.invalid'] },
	            firstname: { type: String },
	            surname: { type: String },
	            gender: { type: String },
	            birthdate: { type: Date, required: true  },
	            email: { type: String },
	            passwordHash: { type: String, required: true },
	            passwordSalt: { type: String },
	            avatar: { type: Schema.Types.ObjectId, ref: 'Media' },
	            locale: { type: Schema.Types.ObjectId, ref: 'Locale' },
	            emailCode: { type: String },
	            verified: { type: String },
	            created: { type: Date, default: Date.now },
	            modified: { type: Date, default: Date.now },
	        },
	        'api': {
	            'path': 'user',
	            'path_plural': 'users',
	            'list': true,
	            'create': true,
	        }
	    },
	};

	module.exports = schemas;
}(module));
