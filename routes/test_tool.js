taskRouter.route('/:taskId/questions/:questionId/answers')
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

taskRouter.route('/:taskId/questions/:questionId/answers/:answerId')
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