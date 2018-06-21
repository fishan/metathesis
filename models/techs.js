//Task, Task comments, Task question and Task answer Schemas
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Task comments schema
var taskCommentSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment:  {
        type: String, minlength: 2, maxlength: 400,
        required: true
    }
}, {
    timestamps: true
});

// Task question schema
var taskQuestionSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    question: {
        type: String,
		minlength: 2,
		maxlength: 400,
        required: true
    }
}, {
    timestamps: true
});

// Task answers schema
var taskAnswerSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answer:  {
        type: String,
		minlength: 2,
		maxlength: 400,
        required: true
    }
}, {
    timestamps: true
});

// Task performer schema
var taskPerformerSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:  {
        type: String,
		default: "approved",
        required: true
    }
}, {
    timestamps: true
});

// Task performer schema
var taskCandidateSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:  {
        type: String,
		default: "applicant",
        required: true
    }
}, {
    timestamps: true
});

//Task schema
var taskSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },	
    title: {
        type: String,
        required: true,
        unique: true
    },
    images: {
	type: Array,
	default : [],
	required: false
    },
    shortdescription: {
        type: String, 
        required: false
    },
    description: {
        type: String,
        required: true
    },
    conditions: {
        type: String,
        required: true
    },	
    status: {
		type: Array,
		default : [
			{
				id: 1,
				title: 'OPEN',
				color: '#00CE00'
			}
		],
		required: false
    },
	category: { 
		type : Array ,
		default : [] 
	},
	tags: {
		type : Array , 
		default : []
	},
	notshowmarker:{
		type: Boolean,
		default: false
	},
    location: {
        type: String,
        required: false
    },
    reward: {
        type: String,
        required: false
    },
    candidatesnum: {
        type: Number,
		default: 0,
		required: false
    },
    questionsnum: {
        type: Number,
		default: 0,
		required: false
    },
    commentsnum: {
        type: Number,
		default: 0,
		required: false
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
    coordLat: {
        type: Number,
        required: false
    },
    coordLon: {
        type: Number,
        required: false
    },
	candidates:[taskCandidateSchema],
	performers:[taskPerformerSchema],
    questions:[taskQuestionSchema],
	answers:[taskAnswerSchema],
    comments:[taskCommentSchema]    
}, {
    timestamps: true
});


var Tasks = mongoose.model('Task', taskSchema);
module.exports = Tasks;


/*
task
post /tasks
{
	"title": "get speed",
	"image": "/images/image.jpg",
	"description": "Some description",
	"text": "task text",
	"status": "open",
	"location": "triigi",
	"reward": "some bucs",
	"xcoords": 15,
	"ycoords": 20
}

comment
post /tasks/:taskId/comments
{
	"comment": "test comment"
}

question
post /tasks/:taskId/questions
{
	"question": "some question text"
}

answer
post /tasks/:taskId/answers
{
	"answer": "some answer text"
}
*/