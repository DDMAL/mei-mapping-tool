var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upload',uploadRouter);

var upload = multer( { dest: 'uploads/' } );

app.post( '/upload', upload.single( 'file' ), function( req, res, next ) {
  // Metadata about the uploaded file can now be found in req.file
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.post("/upload", function(req, res) {
    console.log("UPLOAD POST");
    res.status(201).end()
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
.container {
  column-count: 3;
}