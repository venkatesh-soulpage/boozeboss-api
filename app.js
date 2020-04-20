var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors')

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var locationsRouter = require('./routes/locations');
var clientsRouter = require('./routes/clients');
var agenciesRouter = require('./routes/agencies');
var rolesRouter = require('./routes/roles');
var venuesRouter = require('./routes/venues');
var briefsRoute = require('./routes/briefs');

var app = express();

// Cors
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'})); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/agencies', agenciesRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/briefs', briefsRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
