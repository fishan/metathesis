//leaderRouter
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Proposals = require('../models/proposals');
var Verify = require('./verify');

var proposalRouter = express.Router();
proposalRouter.use(bodyParser.json());

proposalRouter.route('/')
.get(function (req, res, next) {
    Proposals.find(req.query)
	.populate('proposals.postedBy')
	.exec(function (err, proposal) {
        if (err) throw err;
        res.json(proposal);
    });
})

.post( function (req, res, next) {
    Proposals.create(req.body, function (err, proposal) {
        if (err) return next(err);
        console.log('proposal created!');
        var id = proposal._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the proposal with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Proposals.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

proposalRouter.route('/:proposalId')
.get(Verify.verifyOrdinaryUser,function (req, res, next) {
    Proposals.findById(req.params.proposalId, function (err, proposal) {
        if (err) return next(err);
        res.json(proposal);
    });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Proposals.findByIdAndUpdate(req.params.proposalId, {
        $set: req.body
    }, {
        new: true
    }, function (err, proposal) {
        if (err) return next(err);
        res.json(proposal);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Proposals.findByIdAndRemove(req.params.proposalId, function (err, resp) {
		if (err) return next(err);
        res.json(resp);
    });
});
module.exports = proposalRouter;
