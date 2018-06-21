var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Infos = require('../models/infos');
var Verify = require('./verify');

var infoRouter = express.Router();
infoRouter.use(bodyParser.json());

infoRouter.route('/')
.get(function (req, res, next) {
	var language = req.query.language;
	var category = req.query.category;
	var limit = parseInt(req.query.limit) || 20;
	var skip = parseInt(req.query.skip) || 0;
	var randomOne = req.query.randomOne || false;
	
	console.log("1 category = " + category);
	console.log("1 limit = " + limit);
	console.log("1 randomOne = " + randomOne);
	console.log("1 skip = " + skip);
	
	if (randomOne){
		console.log("random info event");
		Infos.aggregate([{$match: {category: category}},{$sample: {size: 1}}])
		.exec(function (err, info) {
			if (err) return next(err);
			//console.log(info);
			res.json(info);
			});		
	}else{	
	Infos.find({language: language, category: category})
		.skip(skip)
		.limit(limit)		
		.exec(function (err, info) {
			if (err) return next(err);
			res.json(info);
		});	
	}
})


.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Infos.create(req.body, function (err, info) {
        if (err) return next(err);
        console.log('info created!');
        var id = info._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the info with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Infos.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

infoRouter.route('/:infoId')
.get(function (req, res, next) {
    Infos.findById(req.params.infoId)
        .exec(function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Infos.findByIdAndUpdate(req.params.infoId, {
        $set: req.body
    }, {
        new: true
    }, function (err, info) {
        if (err) return next(err);
        res.json(info);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Infos.findByIdAndRemove(req.params.infoId, function (err, resp) {
		if (err) return next(err);
        res.json(resp);
    });
});
module.exports = infoRouter;
