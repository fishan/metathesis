//Task, Task comments, Task question and Task answer Schemas
var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Task comments schema
var taskCommentSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
	id:{
        type: Number,
		default: 0
	},
	parentId:{
        type: Number,
		default: 0
	},	
    text:  {
        type: String, minlength: 2, maxlength: 20000,
        required: true
    },
	avatar: {
		type: String
	}
}, {
    timestamps: true
});

// Task question schema
var taskQuestionSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
	id:{
        type: Number,
		default: 0
	},
	parentId:{
        type: Number,
		default: 0
	},	
    title: {
        type: String,
		minlength: 2,
		maxlength: 500,
        required: true
    },	
    text: {
        type: String,
		minlength: 2,
		maxlength: 20000,
        required: true
    },
	avatar: {
		type: String
	},
	answer:{
		type: Array,
		default : {
			text :'',
			status: 0
		}
	}
}, {
    timestamps: true
});

// Task answers schema
var taskAnswerSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
	id:{
        type: Number,
		default: 0
	},
	parentId:{
        type: Number,
		default: 0
	},	
    answer:  {
        type: String,
		minlength: 2,
		maxlength: 20000,
        required: true
    }
}, {
    timestamps: true
});

// Task performer schema
var taskCandidateSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
	taskBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
	},
    status:  {
        type: String,
		default: "Applicant"
    },
	statement: {
		type: String,
		default: ""
	},
	reply: {
		type: String,
		default: ""
	}
}, {
    timestamps: true
});

//Task schema
var taskSchema = new Schema({	
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
	langs:{
		type: Array,
		default : []
    },
    images: {
		type: Array,
		default : [],
		required: false
    },	
    status: {
		type: Array,
		default : [
			{
				id: 1,
				title: 'OPEN',
				color: '#00CE00',
				text: ''
			}
		],
		required: false
    },
	category: { 
		type : Array,
		default : [] 
	},
	showaddress:{
		type: Boolean,
		default: false
	},
	address:{
		type: String
	},	
    visited: {
        type: Number,
		default: 0,
		required: false
    },
    notified: {
        type: Number,
		default: 0,
		required: false
    },
	position: {
		type: {type: String, default: 'Point'},
		coordinates: {type: [Number], default: [ 0, 0]}
	},
	range:  {
        type: Number,
		min: 0,
		max:20000,
		default: 0,
        required: false
    },
	areadesc:{
		type: String
	},
	moverange:{
		type: Boolean,
		default: false
	},
	actrange:{
		type: Boolean,
		default: false
	},
	candidates:[taskCandidateSchema],
    questions:[taskQuestionSchema],
    comments:[taskCommentSchema]    
}, {
	versionKey: false,
    timestamps: true
});


var Tasks = mongoose.model('Task', taskSchema);
module.exports = Tasks;

