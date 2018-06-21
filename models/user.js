//User Schema

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
		type: String,
		minlength: 2,
    },
	profileid:{
		type: String,
	},
    email: {
		type: String,
    },	
    fullname: {
		type: String,
    },	
    password: {
		type: String,
		minlength: 6,
	},
    OauthId: String,
    OauthToken: String,    
    admin:   {
        type: Boolean,
        default: false
    }
});

User.methods.getProfileid = function() {
    return (this.profileid);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);