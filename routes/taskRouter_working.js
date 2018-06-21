var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Tasks = require('../models/tasks');
var Verify = require('./verify');

var taskRouter = express.Router();
taskRouter.use(bodyParser.json());

// Task
taskRouter.route('/')
	.get(function (req, res, next) {
		Tasks.find(req.query)
			.populate('performers.postedBy')			
			.populate('questions.postedBy')
			.populate('answers.postedBy')
			.populate('comments.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task);
		});
	})

	.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.create(req.body, function (err, task) {
			if (err) return next(err);
			console.log('Task created!');
			var id = task._id;

			res.writeHead(200, {
				'Content-Type': 'text/plain'
			});
			res.end('Added the task with id: ' + id);
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.remove({}, function (err, resp) {
			if (err) return next(err);
			res.json(resp);
		});
	});

	taskRouter.route('/:taskId')
	.get(function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('comments.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task);
		});
	})

	.put(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findByIdAndUpdate(req.params.taskId, {
			$set: req.body
		}, {
			new: true
		}, function (err, task) {
			if (err) return next(err);
			res.json(task);
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findByIdAndRemove(req.params.taskId, function (err, resp) {
			if (err) return next(err);
			res.json(resp);
    });
});

// Task performers
taskRouter.route('/:taskId/performers')
	.get(function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('performers.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.performers);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded._id;
			task.performers.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Performers!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			for (var i = (task.performers.length - 1); i >= 0; i--) {
				task.performers.id(task.performers[i]._id).remove();
			}
			task.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
			});
			res.end('Deleted all performers!');
		});
	});
});

taskRouter.route('/:taskId/performers/:performerId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('performers.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.performers.id(req.params.performerId));
		});
	})
	.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findByIdAndUpdate(req.params.performerId, {
			$set: req.body
		}, {
			new: true
		}, function (err, task) {
			if (err) return next(err);
			res.json(task);
		});
	})	
	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (task.performers.id(req.params.performerId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			task.performers.id(req.params.performerId).remove();
			task.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
		});
	});
});

// Task comments
taskRouter.route('/:taskId/comments')
	.get(function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('comments.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.comments);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded._id;
			task.comments.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Comments!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			for (var i = (task.comments.length - 1); i >= 0; i--) {
				task.comments.id(task.comments[i]._id).remove();
			}
			task.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
			});
			res.end('Deleted all comments!');
		});
	});
});

taskRouter.route('/:taskId/comments/:commentId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('comments.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.comments.id(req.params.commentId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		// We delete the existing commment and insert the updated
		// comment as a new comment
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			task.comments.id(req.params.commentId).remove();
			req.body.postedBy = req.decoded._id;
			task.comments.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Comments!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (task.comments.id(req.params.commentId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			task.comments.id(req.params.commentId).remove();
			task.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
		});
	});
});

taskRouter.route('/:taskId/questions')
	.get(function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('questions.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.questions);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded._id;
			task.questions.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Questions!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			for (var i = (task.questions.length - 1); i >= 0; i--) {
				task.questions.id(task.questions[i]._id).remove();
			}
			task.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
			});
			res.end('Deleted all questions!');
		});
	});
});

taskRouter.route('/:taskId/questions/:questionId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('questions.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.questions.id(req.params.questionId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser, function (req, res, next) {
		// We delete the existing question and insert the updated
		// question as a new question
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			task.questions.id(req.params.questionId).remove();
			req.body.postedBy = req.decoded._id;
			task.questions.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Questions!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (task.questions.id(req.params.questionId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			task.questions.id(req.params.questionId).remove();
			task.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
		});
	});
});

taskRouter.route('/:taskId/answers')
	.get(function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('answers.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.answers);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded._id;
			task.answers.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated answers!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			for (var i = (task.answers.length - 1); i >= 0; i--) {
				task.answers.id(task.answers[i]._id).remove();
			}
			task.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
			});
			res.end('Deleted all answers!');
		});
	});
});

taskRouter.route('/:taskId/answers/:answerId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate('answers.postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.answers.id(req.params.answerId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser, function (req, res, next) {
		// We delete the existing answer and insert the updated
		// answer as a new answer
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			task.answers.id(req.params.answerId).remove();
			req.body.postedBy = req.decoded._id;
			task.answers.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated answers!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (task.answers.id(req.params.answerId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			task.answers.id(req.params.answerId).remove();
			task.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
		});
	});
});



module.exports = taskRouter;
