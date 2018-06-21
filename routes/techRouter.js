var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Techs = require('../models/techs');
var Verify = require('./verify');

var techRouter = express.Router();
techRouter.use(bodyParser.json());

techRouter.route('/')
.get(function (req, res, next) {		
	Techs.find(req.query)				
		.exec(function (err, tech) {
			if (err) return next(err);
			res.json(tech);
		});	
	}
})


.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Techs.create(req.body, function (err, tech) {
        if (err) return next(err);
        console.log('tech created!');
        var id = tech._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the tech with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Techs.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

techRouter.route('/:techId')
.get(function (req, res, next) {
    Techs.findById(req.params.techId)
        .exec(function (err, tech) {
        if (err) return next(err);
        res.json(tech);
    });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Techs.findByIdAndUpdate(req.params.techId, {
        $set: req.body
    }, {
        new: true
    }, function (err, tech) {
        if (err) return next(err);
        res.json(tech);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Techs.findByIdAndRemove(req.params.techId, function (err, resp) {
		if (err) return next(err);
        res.json(resp);
    });
});
module.exports = techRouter;
