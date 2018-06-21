//db.tasks.createIndex( { position: "2dsphere" } )
//db.profiles.createIndex( { position: "2dsphere" } )

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var LatLon = require('geodesy').LatLonEllipsoidal;

var Profiles = require('../models/profiles');
var Tasks = require('../models/tasks');
var Verify = require('./verify');
var config = require('../config');
var multer = require('multer');
var sharper = require('sharper');

var mkdirp = require('mkdirp');
var fs = require('fs');
var profileIdIs;

var taskRouter = express.Router();
taskRouter.use(bodyParser.json());
taskRouter.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*5,type:'application/x-www-form-urlencoding'}));

function userdirstring(userid){
	var useridstring = userid.toString();
	var idstringlength = (useridstring.length / 3).toFixed(0);
	var userdir = config.userDir;
	var position = 0;				
	for(var i = 0; i < idstringlength; i++){
		userdir = userdir + '/' + useridstring.substring(position, position + 3);
		position = position + 3;
	}
	if (useridstring.length % 3 != 0){	
		userdir = userdir + '/' + useridstring.substring(position, useridstring.length);
	}
	userdir = userdir + '/';
	return userdir;				
};

function dirstring(userid, taskid){
	console.log('dirstring userid ' + userid);
	console.log('dirstring taskid ' + taskid);
	var useridstring = userid.toString();
	var idstringlength = (useridstring.length / 3).toFixed(0);
	var dir = config.userDir;
	var position = 0;				
	for(var i = 0; i < idstringlength; i++){
		dir = dir + '/' + useridstring.substring(position, position + 3);
		position = position + 3;
	}
	if (useridstring.length % 3 != 0){	
		userdir = userdir + '/' + useridstring.substring(position, useridstring.length);
	}
	dir = userdir + '/';
	
	if (taskid){
		dir = userdir + taskid + '/';
		
	}
	
	console.log('dir is ' + dir);
	return dir;				
};

function taskdirstring(userid, taskid){
	var useridstring = userid.toString();
	var idstringlength = (useridstring.length / 3).toFixed(0);
	var userdir = config.userDir;
	var position = 0;				
	for(var i = 0; i < idstringlength; i++){
		userdir = userdir + '/' + useridstring.substring(position, position + 3);
		position = position + 3;
	}
	if (useridstring.length % 3 != 0){	
		userdir = userdir + '/' + useridstring.substring(position, useridstring.length);
	}
	var taskdir = userdir + '/' + taskid + '/';
	return taskdir;				
};

var distance = function (taskLon,taskLat,userLon,userLat){	
	var p1 = new LatLon(taskLat, taskLon);
	var p2 = new LatLon(userLat, userLon);
	var d = p1.distanceTo(p2);
	d = d.toFixed(0);
	console.log('distance = ' + d);
	return d;
};

var distanceRange = function (x,y,range){
	var result = [];
	var p1 = new LatLon(x, y);
	var halfRange = range / 2;
	var c1 = p1.destinationPoint(halfRange, 0);
	result.push(c1);
	var c2 = p1.destinationPoint(halfRange, 90);
	result.push(c2);
	var c3 = p1.destinationPoint(halfRange, 180);
	result.push(c3);
	var c4 = p1.destinationPoint(halfRange, 270);
	result.push(c4);
	//console.log('distanceRange result is ', result)
	return result;
};

// Task
taskRouter.route('/')
	

	.get(function (req, res, next) {
		//var status = req.query.status || [1, 2];
		var statusAString = req.query.status || ['1', '2'];
		var status = [];
		statusAString.forEach(function(item){
			status.push(parseInt(item));
		});
		
		var gtestatus = parseInt(status[0]);
		var ltestatus = parseInt(status[1]);
		var category = req.query.category;
		var limit = parseInt(req.query.limit) || 20;
		var skip = parseInt(req.query.skip) || 0;
		var sort = req.query.sort || {createdAt: -1};
		var minDist = parseInt(req.query.minDist) || 0;
		var maxDist = parseInt(req.query.maxDist) || 10000;
		//maxDist = maxDist*2;
		var centerLon = req.query.centerLon;
		var centerLat = req.query.centerLat;
		var freshTasks = req.query.freshTasks || 'false';
		var createdFromTime = new Date(Date.now() - 24*60*60 * 365*1000).toISOString();
		var createdAtTime = new Date(Date.now() - 24*60*60*1000).toISOString();
		console.log('typeof freshTasks ', typeof(freshTasks));
		if(freshTasks === 'true'){
			console.log('inside freshTask true');
			createdFromTime = new Date(Date.now() - 24*60*60*1000).toISOString();
			createdAtTime = new Date(Date.now()).toISOString();			
		};
		
		console.log('freshTasks is ', freshTasks);
		console.log('createdFromTime is ', createdFromTime);
		console.log('createdAtTime is ', createdAtTime);		
		console.log('minDist is ', minDist);	
		console.log('maxDist is ', maxDist);	
		console.log('centerLon is ', centerLon);	
		console.log('centerLat is ', centerLat);	
				
		Tasks.find(
			{
				'status.0.id': {$in: status},
				'createdAt':{$gte: createdFromTime, $lt:createdAtTime},
				'position':
				   { $nearSphere:
					  {
						$geometry: { type: "Point",  coordinates: [ centerLon, centerLat ] },
						$maxDistance: maxDist,
						$minDistance: minDist
					  }
				   }
				   
			}		
		)
			.skip(skip)
			.limit(limit)
			.sort(sort)
			.populate('postedBy')			
			.exec(function (err, tasks) {
			if (err) return next(err);
			res.json(tasks);			
		});
		
/* 		 
		Tasks.aggregate([
		  {
			$geoNear: {
			  near: {
				type: "Point",
				coordinates: [centerLon, centerLat]
			  },
			  distanceField: "distanceFromMongoDB",
			  spherical: true,
			  query: { 
				'status.0.id': {$in: status},
				'createdAt':{$gte: createdFromTime, $lt:createdAtTime}
				},
			  limit: 5
			}
		  }
		]).pretty();
		 */
	})

	.post(Verify.verifyOrdinaryUser, function (req, res, next) {
		var success = false;
		var notifiedCounter = 0;
		req.body.postedBy = req.decoded.profileid;
		Tasks.create(req.body, function (err, task) {
			if (err) return next(err);			
			var taskid = task._id;
			
			Profiles.findById(req.decoded.profileid, function (err, profile) {
				if (err) return next(err);
				req.body.taskBy = taskid;
				profile.usertasks.push(req.body);
				console.log('push usertask done');
				profile.save(function (err, profile) {
					if (err) return next(err);
					//console.log('Task added to Usertasks with Id ' + profile.usertasks);
					
					res.status(200).json({
						status: 'Task added successfull and profile updated!',
						success: true,
						taskid: taskid
					});
				});
			});
			var taskLon = task.position.coordinates[0];
			var taskLat = task.position.coordinates[1];
			
 			Profiles.find(
				{
					'position':
					   { $nearSphere:
						  {
							$geometry: { type: "Point",  coordinates: [taskLon, taskLat]},
							$maxDistance: 20000,
							$minDistance: 0
						  }
					   }
				} 				
			).exec(function (err, profiles) {
				if (err) return next(err);
				console.log('profiles length' , profiles.length);
				
				
				var taskCatGroup;
				if (task.category[0].id == 1 || task.category[0].id == 2){
					taskCatGroup = 1;
				}else if (task.category[0].id == 3 || task.category[0].id == 4){
					taskCatGroup = 2;
				}else if (task.category[0].id == 5 || task.category[0].id == 6 || task.category[0].id == 7){
					taskCatGroup = 3;
				}else if (task.category[0].id == 8 || task.category[0].id == 9){
					taskCatGroup = 4;
				};
				
				var profArray = [];
				
				console.log('req.decoded.profileid is', req.decoded.profileid);
				console.log('task.postedBy is', task.postedBy);
				profiles.forEach(function(profile, i, arr){				
					var dist = distance(task.position.coordinates[0], task.position.coordinates[1], profile.position.coordinates[0], profile.position.coordinates[1]);
					console.log('distance between task and profile ', profile._id, ' is ', dist);
					dist = dist - profile.range;
					console.log('distance after minus range = ', profile.range, ' is ', dist);
					
					if (task.moverange == true || task.actrange == true){
						dist = dist - task.range;
						console.log('distance after minus task range = ', task.range, ' is ', dist);
					}
					if (dist <= 0){
						console.log('profile with id ' + profiles[i]._id + 'and name '+ profiles[i].fullname +' added to $scope.profArray array');
						profArray.push(profile);
					};
				});
				console.log('profArray is ', profArray);
				profArray.forEach(function(item, i, arr){	
					var conditionLang = 0;
					var conditionCat = 0;
					
					if(item.settings[0]){						
						console.log('item.settings[0].onlyFamiliarLangs 1 = ', item.settings[0].onlyFamiliarLangs);
						if (item.settings[0].onlyFamiliarLangs == true){					
							item.morelang.forEach(function(profilelang){
								var lang = profilelang.code;
								task.langs.forEach(function(tasklang){
									if (lang == tasklang.lang.code){
										conditionLang = 1;
									};
								});
							});
						}else if (item.settings[0].onlyFamiliarLangs == false){
							conditionLang = 1;
						};							
							
						if (item.settings[0].tasksEmergency == true && taskCatGroup == 1) conditionCat = 1;
						if (item.settings[0].tasksTask == true && taskCatGroup == 2) conditionCat = 1;
						if (item.settings[0].tasksCommerce == true && taskCatGroup == 3) conditionCat = 1;
						if (item.settings[0].tasksHelp == true && taskCatGroup == 4) conditionCat = 1;
							
					}else{
						conditionLang = 1;
						conditionCat = 1;
					};	

					var taskPostedBy = JSON.stringify(task.postedBy);
					var itemDotId = JSON.stringify(item._id);					
					
					if (taskPostedBy != itemDotId){				
						if (conditionLang == 1 && conditionCat == 1){
							console.log('Profile id to add recommended is ' , item._id);
							req.body.taskBy = taskid;
							req.body.taskstatus = 'Recommended';
							item.othertasks.push(req.body);
							notifiedCounter++;
							console.log('push usertask done');
							item.save(function (err, item) {
								if (err) return next(err);
								console.log('Task added to othertasks with Id ');

							});
						};
					};	
				});
				task.notified = notifiedCounter;
				task.save(function (err, task) {
					if (err) return next(err);
					console.log('Task notified = ', notifiedCounter);
				});
			});
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
		console.log('req.decoded 1', req.decoded);
		Tasks.findById(req.params.taskId)
			.populate('postedBy')
			.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'othertasks.taskBy', model: 'Task'}})		
			.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'comments.taskBy', model: 'Task'}})	
			.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'comments.postedBy', model: 'Profile'}})	
			.populate('questions.postedBy')
			.populate('comments.postedBy')
			.exec(function (err, task) {
				if (err) return next(err);
				res.json(task);
				console.log('req.decoded 2', req.decoded);
				
				if(req.decoded){
					console.log('req.decoded.profileid is ', req.decoded.profileid);
					console.log('task.postedBy._id is ', task.postedBy._id);
					if(req.decoded.profileid == task.postedBy._id){
						console.log('Task owner');
					
					}else{
						if(task){
							task.visited++;
							task.save(function (err, task) {
								if (err) return next(err);
								console.log('Task visited +1 1');
							});
						};	
					};
				}else{
					if(task){
						task.visited++;
						task.save(function (err, task) {
							if (err) return next(err);
							console.log('Task visited +1 1');
						});
					};
				};
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


// Task candidates
taskRouter.route('/:taskId/candidates')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			//.populate('candidates.postedBy')			
			.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'comments.taskBy', model: 'Task'}})
			.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'comments.postedBy', model: 'Profile'}})
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.candidates);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			console.log("req.decoded.profileid is " + req.decoded.profileid);
			if (err) return next(err);
			req.body.postedBy = req.decoded.profileid;
			task.candidates.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Added Candidate!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			for (var i = (task.candidates.length - 1); i >= 0; i--) {
				task.candidates.id(task.candidates[i]._id).remove();
			}
			task.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
			});
			res.end('Deleted all candidates!');
		});
	});
});

taskRouter.route('/:taskId/candidates/:candidateId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Tasks.findById(req.params.taskId)
			.populate({ path: 'postedBy.comments', model: 'Profile', populate: {path: 'comments.taskBy', model: 'Task'}})
			.populate({ path: 'postedBy.comments', model: 'Profile', populate: {path: 'comments.postedBy', model: 'Profile'}})
			//.populate({ path: 'comments.postedBy', model: 'Profile'})
			//.populate({ path: 'comments.taskBy', model: 'Task'})
			//.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'comments.taskBy', model: 'Profile'}})
			.exec(function (err, task) {			
			if (err) return next(err);			
			res.json(task.candidates.id(req.params.candidateId));
		});
	})
	
	.put(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			var candidate =  task.candidates.id(req.params.candidateId);
			candidate.status = req.body.status;
			candidate.reply = req.body.reply;
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Candidates!');
				res.json(task);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (task.candidates.id(req.params.candidateId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			task.candidates.id(req.params.candidateId).remove();
			task.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
		});
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
			req.body.postedBy = req.decoded.profileid;
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
			.populate('postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.performers.id(req.params.performerId));
		});
	})
	.put(Verify.verifyOrdinaryUser, function (req, res, next) {
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
			.populate('postedBy')
			.populate('taskBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.comments);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded.profileid;
			task.comments.push(req.body);
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Added Comment!');
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
			.populate('postedBy')
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
			req.body.postedBy = req.decoded.profileid;
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
			.populate('postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.questions);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			req.body.postedBy = req.decoded.profileid;
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
			.populate('postedBy')
			.exec(function (err, task) {
			if (err) return next(err);
			res.json(task.questions.id(req.params.questionId));
		});
	})
	
	.put(Verify.verifyOrdinaryUser,function (req, res, next) {
		Tasks.findById(req.params.taskId, function (err, task) {
			if (err) return next(err);
			var question =  task.questions.id(req.params.questionId);
			question.answer = req.body.answer;
			task.save(function (err, task) {
				if (err) return next(err);
				console.log('Updated Question!');
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
			req.body.postedBy = req.decoded.profileid;
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
			req.body.postedBy = req.decoded.profileid;
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





taskRouter.route('/upload')
	.post(Verify.verifyOrdinaryUser, function(req, res, next) {	
		
		var randomName = Date.now() + (Math.random()*1000).toFixed(0).toString();
		console.log('randomName is ' + randomName);
		var userdir = userdirstring(req.decoded._id);
		
		var Sharper = sharper({
			field : 'file',
			location : userdir,
			dirFormat: 'yy/mm/dd',
			maxFileSize: '5mb',
			fileNameLen : 10,
			accept : ['jpeg', 'jpg', 'png', 'gif'],
			output : 'jpg',
			sizes : [				
				{suffix : 'lg', width : 970, height : 545},
				{suffix : 'md', width : 460, height : 258},
				{suffix : 'thumb-card', width : 270, height : 200},
				{suffix : 'thumb-list', width : 213, height : 120},				
				{suffix : 'thumb-galery', width : 150, height : 85}				
			]
		});		
		Sharper(req,res,function(err){
			if (err) return next(err);
			
			var taskdir = res.sharper.destination;
			var taskImageLink = config.serverUrl + taskdir.substring( 9, taskdir.length) + '/' + res.sharper.filename;

			Tasks.findByIdAndUpdate(req.body.taskid, {
				$addToSet: {images: taskImageLink}
			}, {
				new: true
			}, function (err, task) {
				if (err){
					return next(err);
				} 
				//console.log('image path add to task complete !');
			});
			
			res.status(200).json({
				status: 'Images added successfull and task updated !',
				success: true				
			});			
		})
	});









taskRouter.route('/uploads')
	.post(Verify.verifyOrdinaryUser, function(req, res, next) {		
		var randomName = Date.now() + (Math.random()*1000).toFixed(0).toString();
		console.log('randomName is ' + randomName);
		var userdir = userdirstring(req.decoded._id);
		var userlink = config.serverUrl + userdir.substring( 9, userdir.length);
		console.log('userlink in upload is ' + userlink);

		var storage = multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, userdir);
			},
			filename: function (req, file, cb) {

				cb(null, randomName + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
			}
		})

		var upload = multer({ storage: storage }).single('file');
		
		
		upload(req,res,function(err){
			if (err) return next(err);
			//console.log('req.body is ' , req.body);	
			//console.log('req.file is ' , req.file);			
			var originalFileName = req.file.originalname;
			console.log('req.file.originalname ' + req.file.originalname);			
			var filename = randomName + '.' + originalFileName.split('.')[originalFileName.split('.').length -1];
			console.log(filename);
			
			Tasks.findByIdAndUpdate(req.body.taskid, {
				$addToSet: {images: userlink + filename}
			}, {
				new: true
			}, function (err, task) {
				if (err){
					return next(err);
				} 
				console.log('image path add to task complete !');
			}); 			
			res.status(200).json({
				status: 'Images added successfull and task updated!',
				success: true				
			});			
		})
	})

;



module.exports = taskRouter;
