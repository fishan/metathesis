var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');

var config = require('./config');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

var routes = require('./routes/index');
var users = require('./routes/users');
var taskRouter = require('./routes/taskRouter');
var profileRouter = require('./routes/profileRouter');
var infoRouter = require('./routes/infoRouter');
var favoriteRouter = require('./routes/favoriteRouter');
var complainRouter = require('./routes/complainRouter');
var proposalRouter = require('./routes/proposalRouter');


var app = express();

// Secure traffic only

app.all('*', function(req, res, next){
	console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
	if (req.secure) {
		return next();
	}
	res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
});


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(function(req,res,next){setTimeout(next,3000)});


app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*5,type:'application/x-www-form-urlencoding'}));
app.use(cookieParser());

// passport config
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, '/public/app/')));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', routes);
app.use('/users', users);
app.use('/tasks', taskRouter);
app.use('/profiles', profileRouter);
app.use('/infos', infoRouter);
app.use('/favorites', favoriteRouter);
app.use('/complains', complainRouter);
app.use('/proposals', proposalRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		message: err.message,
		error: {}
	});
});

app.get('*', function(req, res) {
        res.sendfile('./public/app/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


module.exports = app;
