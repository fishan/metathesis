//Profile, Profile comments, Profile user tasks Schemas
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Profile comments schema
var profileCommentSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    taskBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
	rating:  {
        type: Number,
		default: 0,
        required: false
    },
    comment:  {
        type: String,
		//minlength: 2,
		//maxlength: 2000,
        required: true
    }
}, {
    timestamps: true
});

// Profile user tasks schema
var userTasksSchema = new Schema({
    taskBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    }
},
{
    timestamps: true
});


// Profile other tasks schema
var otherTasksSchema = new Schema({
    taskBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
	taskstatus: {
		type: String,
        default: ''
    }	
},
{
    timestamps: true
});

// Profile schema
var profileSchema = new Schema({
	username: {
      type: String,
        default: ''
    },
	fullname: {
      type: String,
        default: ''
    },
    email: {
      type: String,
        default: ''
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
	mainlang:  {
		type : Array, 
		default : []
	},
	morelang:  {
		type : Array, 
		default : []
	},
	userdir:  {
        type: String,		
        required: false
    },
    image:  {
        type: String,
		default: './images/icons/empty-profile.png',
        required: false
    },
    completed:  {
        type: Number,
		default: 0,
        required: false
    },
    published:  {
        type: Number,
		default: 0,
        required: false
    },
    ratingSumm:  {
        type: Number,
		default: 0,
        required: false
    },
    ratingCount:  {
        type: Number,
		default: 0,
        required: false
    },	
    info:  {
        type: String,
		default: '',
        required: false
    },
    skills:  {
        type: String,
		default: '',
        required: false
    },
	settings:  {
		type : Array, 
		default : [
			{
				onlyFamiliarLangs : true,
				tasksEmergency : true,
				tasksTask : true,
				tasksCommerce : true,
				tasksHelp : true
			}
		]
	},
/*     coordLat:  {
        type: Number,
		default: 0,
    },
    coordLon:  {
        type: Number,
		default: 0, 
	},	*/
	
	position: {
		type: {type: String, default: 'Point'},
		coordinates: {type: [Number], default: [ 0, 0]}
	},    
    range:  {
        type: Number,
		min: 100,
		max:20000,
		default: 300,
        required: false
    },
    usertasks:[userTasksSchema],
    othertasks:[otherTasksSchema],
    comments:[profileCommentSchema]
},{
    timestamps: true
});

var Profiles =  mongoose.model('Profile', profileSchema);
module.exports = Profiles;
