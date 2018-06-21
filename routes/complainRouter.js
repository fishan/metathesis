var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Complains = require('../models/complains');
var Verify = require('./verify');

var complainRouter = express.Router();
complainRouter.use(bodyParser.json());

complainRouter.route('/')
.get(function (req, res, next) {
    Complains.find({}, function (err, complain) {
        if (err) return next(err);
        res.json(complain);
    });
})

.post( function (req, res, next) {
    Complains.create(req.body, function (err, complain) {
        if (err) return next(err);
        console.log('complain created!');
        var id = complain._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the complain with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Complains.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

complainRouter.route('/:complainId')
.get(Verify.verifyOrdinaryUser,function (req, res, next) {
    Complains.findById(req.params.complainId, function (err, complain) {
        if (err) return next(err);
        res.json(complain);
    });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Complains.findByIdAndUpdate(req.params.complainID, {
        $set: req.body
    }, {
        new: true
    }, function (err, complain) {
        if (err) return next(err);
        res.json(complain);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Complains.findByIdAndRemove(req.params.complainID, function (err, resp) {        if (err) return next(err);
        res.json(resp);
    });
});

module.exports = complainRouter;
