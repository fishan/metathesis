var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorite = require('../models/favorites');
var Task = require('../models/tasks');
var Verify = require('./Verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser)
    .get(function (req, res, next) {
        Favorite.find({'postedBy': req.decoded._id})
            .populate('postedBy')
            .populate('tasks')
            .exec(function (err, favorites) {
                if (err) return next(err);
                res.json(favorites);
            });
    })

    .post(function (req, res, next) {

        Favorite.find({'postedBy': req.decoded._id})
            .exec(function (err, favorites) {
                if (err) return next(err);
                req.body.postedBy = req.decoded._id;

                if (favorites.length) {
                    var favoriteAlreadyExist = false;
                    if (favorites[0].tasks.length) {
                        for (var i = (favorites[0].tasks.length - 1); i >= 0; i--) {
                            favoriteAlreadyExist = favorites[0].tasks[i] == req.body._id;
                            if (favoriteAlreadyExist){ 
								console.log('Favorite already exist ');
								break;}
                        }
                    }
                    if (!favoriteAlreadyExist) {
                        favorites[0].tasks.push(req.body._id);
                        favorites[0].save(function (err, favorite) {
                            if (err) return next(err);
                            console.log('Um somethings up!');
                            res.json(favorite);
                        });
                    } else {
                        console.log('Setup!');
                        res.json(favorites);
                    }

                } else {

                    Favorite.create({postedBy: req.body.postedBy}, function (err, favorite) {
                        if (err) return next(err);
                        favorite.tasks.push(req.body._id);
                        favorite.save(function (err, favorite) {
                            if (err) return next(err);
                            console.log('Something is up!');
                            res.json(favorite);
                        });
                    })
                }
            });
    })

    .
    delete(function (req, res, next) {
        Favorite.remove({'postedBy': req.decoded._id}, function (err, resp) {
            if (err) return next(err);
            res.json(resp);
        })
    });

favoriteRouter.route('/:taskId')
    .all(Verify.verifyOrdinaryUser)
    .delete(function (req, res, next) {

        Favorite.find({'postedBy': req.decoded._id}, function (err, favorites) {
            if (err) return next(err);
            var favorite = favorites ? favorites[0] : null;

            if (favorite) {
                for (var i = (favorite.tasks.length - 1); i >= 0; i--) {
                    if (favorite.tasks[i] == req.params.taskId) {
                        favorite.tasks.remove(req.params.taskId);
                    }
                }
                favorite.save(function (err, favorite) {
                    if (err) return next(err);
                    console.log('Here you go!');
                    res.json(favorite);
                });
            } else {
                console.log('No favourites!');
                res.json(favorite);
            }

        });
    });

module.exports = favoriteRouter;