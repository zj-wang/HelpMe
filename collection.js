Jobs = new Mango.Collection("jobs");

var Schemas = {};

Schemas.UserProfile = new SimpleSchema({		
	firstName: {
		type: String,
		regEx: /^[a-zA-Z_]{1,15}$/,
	},
	lastName: {
		type: String,
		regEx: /^[a-zA-Z_]{1,15}$/,
	}
	sex: {
		type: String,
	},
	age: {
		type: Number,
	},
	avatar: {
		type: String,
		optional: true
	}
});

Schemas.User = new SimpleSchema({
	//phone number
    username: {
        type: String,
        regEx: /^\+[a-z0-9A-Z_]{3,15}$/,
        optional:true
    },
	emails: {
		type: [Object],
		optional: true
	},
	'emails.$.address': {
		type:String,
		regEx: SimpleSchema.RegEx.Email
	},
	'emails.$.verified': {
		type:Boolean
	},
	createdAt: {
		type:Date
	},
	profile: {
		type: Schemas.UserProfile,
		optional: true
	},
	services: {
		type: Object,
		optional:true,
		blackbox:true
	}
    /*(roles: {
        type: [String],
        optional: true
    }*/
});

Schemas.Job = new SimpleSchema({
	jobName:{
		type: String
		regEx: /^\+[a-z0-9A-Z_]{3,15}$/
	},
	createdAt: {
		type:Date
	},
	expireAt: {
		type:Date
	}
});

Meteor.users.attachSchema(Schemas.User);
Jobs.attachSchema(Schemas.Job);