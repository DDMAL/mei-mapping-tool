//Requirements for app.js
var express = require('express'),
    compression = require('compression'),
    path = require('path'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');
mongoose = require('mongoose');
var db = require('./model/db'),
    multer = require('multer'),
    neume = require('./model/neumes');
image = require('./model/images');
project = require('./model/projects');
storedImages = require("./model/storedImages");
section = require("./model/section");

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost:27017/mei-mapping-tool');
var db = mongoose.connection;
var routes = require('./routes/router'),
    neumes = require('./routes/neumes'),
    projects = require('./routes/projects');
var app = express();
var uuid = require('uuid');
global.imageArray = []; //This variable is initiated everytime the edit page loads.

var logger = require('./logger');

// Include gzipping
app.use(compression());

app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

//Adding routes for the users index page
app.use('/', routes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var multer = require('multer');

//If folder doesn't exist, create a new uploads folder :
var fs = require('fs');
var dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
var tmpPath = 0;
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        logger.info(uuid.v4())
        global.id = uuid.v4() + ".jpg";
        cb(null, id + "") //Changing pathname to unique path
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        //call the create function for our database

        mongoose.model('image').create({
            imagepath: id, //unique pathname
        }, function(err, image) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //neume has been created
                logger.info('POST creating new image: ' + image);
                imageArray.push(image.imagepath);
            }
        })
    }
})

//if a file is removed from the dropzone :
//if the remove button is pressed in the dropzone,
//You need to unlink the file "file" :

var upload = multer({
    storage: storage
});
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('tiny'));
}
else {
    app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(multer({
    storage
}).any()); // dest is not necessary if you are happy with the default: /tmp
app.use(express.static(path.join(__dirname, 'bower_components')));
// routes for Dropzone element
app.get('/image', function(req, res) {
    res.send('<html><head><title>Dropzone example</title><link href="/stylesheets/dropzone.css" rel="stylesheet"></head><body><h1>Using Dropzone</h1><form method="post" action="/" class="dropzone" id="dropzone-example"><div class="fallback"><input name="file" type="file" multiple /></div></form><p><a href="/old">Old form version</a></p><script src="/javascripts/dropzone.js"></script></body></html>');
});


app.get('/old', function(req, res) {
    res.send('<html><head><title>Dropzone example</title><link href="/stylesheets/dropzone.css" rel="stylesheet"></head><body><h1>Old form</h1><form method="post" action="/" id="old-example" enctype="multipart/form-data"><input name="file" type="file" multiple /><button>Save</button></form><script src="/javascripts/dropzone.js"></script></body></html>');
});

app.post('/image', function(req, res) {
    //logger.info (req.files);
    res.status(200).send('good Request');
});

app.use('/', routes);
app.use('/neumes', neumes);
app.use('/projects', projects);

//app.use('/users', users);
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('express-flash');
app.use(flash());


// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//On click example of the deleted image (Still working on it)
app.post('/clicked', (req, res) => {
    logger.info("work");
    // delete file named 'sample.txt'
    fs.unlink('Punctum.jpg', function(err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        logger.info('File deleted!');
    });
});

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
