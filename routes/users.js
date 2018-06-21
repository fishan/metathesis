var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var mkdirp = require('mkdirp');
var fs = require('fs');


var Profiles = require('../models/profiles');
var Verify = require('./verify');
router.use(bodyParser.json());

function dircreate(dir){
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
}

function userdirstring(userid){
	var useridstring = userid.toString();
	var idstringlength = (useridstring.length / 3).toFixed(0);
	var userdir = './public/users';
	var position = 0;				
	for(i = 0; i < idstringlength; i++){
		userdir = userdir + '/' + useridstring.substring(position, position + 3);
		position = position + 3;
	}
	if (useridstring.length % 3 != 0){	
		userdir = userdir + '/' + useridstring.substring(position, useridstring.length);
	}
	userdir = userdir + '/'
	
	return userdir;				
};			


/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin,  function(req, res, next) {
  User.find({}, function (err, user){
    if (err) {
      err.status = 403;
      next(err);
    }
    res.json(user);
  });
});

router.post('/register', function(req, res) {
    User.register(new User({ 
		username : req.body.username,
		fullname: req.body.fullname,
		email: req.body.email
	}),
	req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        passport.authenticate('local')(req, res, function () {
			req.body.postedBy = user._id;	
			var userdir = userdirstring(user._id);
			console.log('userdir is ' + userdir);
			
			mkdirp(userdir, function (err) {
				if (err) return next(err);
				else console.log('user directory created!')
			});
			req.body.userdir = userdir;
			var createdProfileId;
			Profiles.create(req.body, function (err, profile){
				if (err) return next(err);
				console.log('profile created! ' + req.body.postedBy);				
				req.body.profileid = profile._id;
				createdProfileId = profile._id;
				console.log('Added the profile with id: ' + req.body.profileid);
				User.findByIdAndUpdate(req.body.postedBy,{
					$set: {profileid: req.body.profileid}					
				}, {
					new: true
				}, function (err, user) {
						if (err) return next(err);
						console.log("user is "+ user);						
						return res.status(200).json(
							{
								status: 'Registration Successful! UserId ' + user.id + ' ProfileId ' + profile._id
							}
						);
					});	
				}
			);
        });
    });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      //var token = Verify.getToken(user);
	  var token = Verify.getToken({"username":user.username, "_id":user._id, "profileid":user.profileid, "admin":user.admin});
	  console.log("profileid in token "+ user.profileid);
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
		profileid: user.profileid,
		userid: user._id
      });
    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
    req.logout();
	res.status(200).json({status: 'Bye!'});
});


router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
              var token = Verify.getToken(user);
              res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});


module.exports = router;
