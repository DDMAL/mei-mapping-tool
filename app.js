//The brains fo the code
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');
    mongoose = require('mongoose');
var db = require('./model/db'),
    multer = require('multer'),
    neume = require('./model/neumes');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');


var routes = require('./routes/index'),
    neumes = require('./routes/neumes');
 
var index = require('./routes/index');
//var users = require('./routes/users');
var users = require('./routes/users');
var uploads = require('./routes/upload');

var app = express();

app.use('/', index);
app.use('/users', users);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())  
app.use(passport.session()) 
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: 'uploads'}).any()); // dest is not necessary if you are happy with the default: /tmp
app.use(express.static(path.join(__dirname, 'bower_components')));
// routes
app.get('/', function (req, res) {
    res.send('<html><head><title>Dropzone example</title><link href="/dropzone/downloads/css/dropzone.css" rel="stylesheet"></head><body><h1>Using Dropzone</h1><form method="post" action="/" class="dropzone" id="dropzone-example"><div class="fallback"><input name="file" type="file" multiple /></div></form><p><a href="/old">Old form version</a></p><script src="/dropzone/downloads/dropzone.js"></script></body></html>');
});

app.get('/old', function (req, res) {
    res.send('<html><head><title>Dropzone example</title><link href="/dropzone/downloads/css/dropzone.css" rel="stylesheet"></head><body><h1>Old form</h1><form method="post" action="/" id="old-example" enctype="multipart/form-data"><input name="file" type="file" multiple /><button>Save</button></form><script src="/dropzone/downloads/dropzone.js"></script></body></html>');
});

app.post('/', function (req, res) {
    //console.log(req.files);

    var files = req.files.file;
    if (Array.isArray(files)) {
        // response with multiple files (old form may send multiple files)
        console.log("Got " + files.length + " files");
    }
    else {
        // dropzone will send multiple requests per default
        console.log("Got one file");
    }
    res.sendStatus(200);
});
app.use('/', routes);
app.use('/neumes', neumes);
app.use('/upload', uploads);
//app.use('/users', users);
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use('/', index);
app.use('/users', users);


// passport configuration
var User = require('./model/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
