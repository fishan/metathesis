var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('../models/user');
var Profiles = require('../models/profiles');
var Task = require('../models/tasks');
var Verify = require('./verify');
var config = require('../config');
var multer = require('multer');
var profileRouter = express.Router();
profileRouter.use(bodyParser.json());
profileRouter.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*5,type:'application/x-www-form-urlencoding'}));


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

profileRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Profiles.find()
            .populate('postedBy')
            .exec(function (err, profiles) {
                if (err) return next(err);
				console.log('profiles find' , profiles);
                res.json(profiles);
            });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findOne({'postedBy': req.decoded._id}, function (err, profile){
			if (profile) {
				console.log('Profile already exist 1');
				res.json(profile);
			} else {
				req.body.postedBy = req.decoded._id;
				Profiles.create(req.body, function (err, profile){
					if (err) return next(err);
					console.log('profile created! ' + req.body.postedBy);
					req.body.profileid = profile._id;
					console.log('Added the profile with id: ' + req.body.profileid);
					User.findByIdAndUpdate(req.body.postedBy,{
						$set: {profileid: req.body.profileid}					
					}, {
						new: true
					}, function (err, user) {
							if (err) return next(err);
							console.log("user is "+ user);
						});
									
					});
			};
	})})

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Profiles.remove({}, function (err, resp) {
            if (err) return next(err);
            res.json(resp);
        })
    });
	
				

profileRouter.route('/:profileId')

	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findById(req.params.profileId)
		.populate('postedBy')
		.populate('usertasks.taskBy')
		.populate('othertasks.taskBy')
		//.populate({path:'candidates.postedBy', model: 'Profile', populate: {path: 'othertasks.taskBy', model: 'Task'}})
		.populate({path:'comments.postedBy', model: 'Profile'})
		.populate({path:'comments.taskBy', model: 'Task'})
		.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile);
		});
	})

/* 	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findById(req.params.profileId)
		.populate('postedBy')
		.populate('usertasks.taskBy')
		.populate('othertasks.taskBy')
		.populate('comments.postedBy')
		.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile);
		});
	}) */
	
/* 	.get(Verify.verifyOrdinaryUser, function (req, res, next){
		//req.params.profileId = req.decoded.profileid;
		//Profiles.findById(req.decoded.profileid)

		var query = Profiles.findOne({'postedBy': req.decoded._id}, function (err, profile){
			if (profile) {
				console.log('Profile already exist 2');
				query
				.populate('postedBy')
				.populate('usertasks.taskBy')
				.populate('othertasks.taskBy')
				.populate('comments.postedBy')
				.exec(function(err, profile){
					if (err) return next(err);
					res.json(profile);
				});
				//res.json(profile);
			} else {
				console.log('profile not found and will be created !');
				User.findById(req.decoded._id, function (err, user) {
					if (err) return next(err);
					req.body.postedBy = req.decoded._id;
					req.body.username = user.username;
					req.body.fullname = user.fullname;
					req.body.email = user.email;
					Profiles.create(req.body, function (err, profile){
						if (err) return next(err);
						console.log('profile created by user id ' + req.body.postedBy);
						req.body.profileid = profile._id;
						req.decoded.profileid = profile._id;
						console.log('Added the profile with id: ' + req.body.profileid);
						User.findByIdAndUpdate(req.body.postedBy,{
							$set: {profileid: req.body.profileid}					
						}, {
							new: true
						}, function (err, user) {
								if (err) return next(err);
								console.log("user is "+ user);
							});
						res.json(profile);
					});
				});				
			};
		})
	}) */
	
	.put(Verify.verifyOrdinaryUser, function (req, res, next) {
		console.log("in profile put req.decoded.profileid is " + req.decoded.profileid);
		Profiles.findByIdAndUpdate(req.decoded.profileid, {
			$set: req.body
		}, {
			new: true
		}, function (err, profile) {
			if (err) return next(err);			
			res.json(profile);
			console.log(' Profile update success !');
		});

/* 		Profiles.findById(req.decoded.profileid, function (err, profile) {
			if (err) return next(err);
			//dish.comments.id(req.params.commentId).remove();
			//req.body.postedBy = req.decoded._id;
			profiles.push(req.body);
			profiles.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Profile!');
				res.json(profile);
			});
		});	 */		
		
	})
	
	.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findByIdAndRemove(req.params.profileId, function (err, resp) {
			if (err) return next(err);
			res.json(resp);
		});
	})
	
	profileRouter.route('/:profileId/usertasks')
	.get(function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('usertasks.usertaskId')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.usertasks);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			req.body.postedBy = req.decoded._id;
			profile.usertasks.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated User Tasks!');
				res.json(profile);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			for (var i = (profile.usertasks.length - 1); i >= 0; i--) {
				profile.usertasks.id(profile.usertasks[i]._id).remove();
			}
			profile.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Deleted all usertasks!');
			});
		});
	})

	profileRouter.route('/:profileId/usertasks/:usertaskId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('usertasks.postedBy')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.usertasks.id(req.params.usertaskId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		// We delete the existing commment and insert the updated
		// usertask as a new usertask
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			profile.usertasks.id(req.params.usertaskId).remove();
			req.body.postedBy = req.decoded._id;
			profile.usertasks.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated User Task!');
				res.json(profile);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (profile.usertasks.id(req.params.usertaskId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			profile.usertasks.id(req.params.usertaskId).remove();
			profile.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
			});
		});
	})

	profileRouter.route('/:profileId/othertasks')
	.get(function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('othertasks.taskBy')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.othertasks);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {		
		Profiles.findById(req.params.profileId, function (err, profile) {
			console.log('req.params is ', req.params);
			console.log('req.body is ' , req.body);
			if (err) return next(err);
			profile.othertasks.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Othertasks!');
				res.json(profile);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			for (var i = (profile.othertasks.length - 1); i >= 0; i--) {
				profile.othertasks.id(profile.othertasks[i]._id).remove();
			}
			profile.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Deleted all othertasks!');
			});
		});
	})

	profileRouter.route('/:profileId/othertasks/:othertaskId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('othertasks.taskBy')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.othertasks.id(req.params.othertaskId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser,function (req, res, next) {
		// othertask as a new othertask
/* 		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			profile.othertasks.id(req.params.othertaskId).remove();
			req.body.postedBy = req.decoded._id;
			profile.othertasks.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Othertask!');
				res.json(profile);
			});
		}); */
		
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			var othertask =  profile.othertasks.id(req.params.othertaskId);
			othertask.taskstatus = req.body.taskstatus;
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Othertasks!');
				res.json(profile);
			});
		});

		
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (profile.othertasks.id(req.params.othertaskId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			profile.othertasks.id(req.params.othertaskId).remove();
			profile.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
			});
		});
	})
	
	profileRouter.route('/:profileId/comments')
	.get(function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('comments.postedBy')
			.populate('comments.taskBy')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.comments);
		});
	})

	.post(Verify.verifyOrdinaryUser,function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			console.log('req.params is ', req.params);
			console.log('req.body is ' , req.body);
			if (err) return next(err);
			profile.comments.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Comments!');
				res.json(profile);
			});
		});		
	})
	
	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			for (var i = (profile.comments.length - 1); i >= 0; i--) {
				profile.comments.id(profile.comments[i]._id).remove();
			}
			profile.save(function (err, result) {
				if (err) return next(err);
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Deleted all comments!');
			});
		});
	})

	profileRouter.route('/:profileId/comments/:commentId')
	.get(Verify.verifyOrdinaryUser, function (req, res, next) {
		Profiles.findById(req.params.profileId)
			.populate('postedBy')
			.populate('taskBy')
			.exec(function (err, profile) {
			if (err) return next(err);
			res.json(profile.comments.id(req.params.commentId));
		});
	})
	//////
	.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		// We delete the existing commment and insert the updated
		// comment as a new comment
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (err) return next(err);
			profile.comments.id(req.params.commentId).remove();
			req.body.postedBy = req.decoded._id;
			profile.comments.push(req.body);
			profile.save(function (err, profile) {
				if (err) return next(err);
				console.log('Updated Comment!');
				res.json(profile);
			});
		});
	})

	.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin,function (req, res, next) {
		Profiles.findById(req.params.profileId, function (err, profile) {
			if (profile.comments.id(req.params.commentId).postedBy != req.decoded._id) {
			  var err = new Error('You are not authorized to perform this operation!');
				err.status = 403;
				return next(err);
			}
			profile.comments.id(req.params.commentId).remove();
			profile.save(function (err, resp) {
				if (err) return next(err);
				res.json(resp);
			});
		});
	})	
	
	
profileRouter.route('/upload')
	.post(Verify.verifyOrdinaryUser, function(req, res, next) {
		var userdir = userdirstring(req.decoded._id);
		var userlink = config.serverUrl + userdir.substring( 9, userdir.length);
		console.log('userlink in upload is ' + userlink);
		var storage = multer.diskStorage({
			destination: function (req, file, cb) {
			cb(null, userdir);
			},
			filename: function (req, file, cb) {

			cb(null, req.decoded.profileid + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
			}
		})

		var upload = multer({ storage: storage }).single('file');
		upload(req,res,function(err){
			if (err) return next(err);
			var originalFileName = req.file.originalname;		
			var filename = req.decoded.profileid + '.' + originalFileName.split('.')[originalFileName.split('.').length -1];
			console.log(filename);
			
			Profiles.findByIdAndUpdate(req.decoded.profileid, {
				$set: {image: userlink + filename}
			}, {
				new: true
			}, function (err, profile) {
				if (err){
					return next(err);
				} 
				console.log('image path change complete !');
			});			
			res.json({
				success:true,
				message: 'Upload complete !'
			});			
		})
	})
	

	
	;

module.exports = profileRouter;