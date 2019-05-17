var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectRouter = require('./routes/projects');
var noteRouter = require('./routes/note.routes')

// Require bcrypt for the password
 bcrypt = require('bcrypt'),
 SALT_WORK_FACTOR = 10;


var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())


/////DATABASE FOR USERS:
// Configuring the database
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
//Change this line to the database you want the user name and password to be posted to
mongoose.connect("mongodb://localhost:27017/userDatabase");

//Testing the database for userDatabase schema:
var nameSchema = new mongoose.Schema({
    username: String,
    password: String,
    type: String
});

//Hashing to hide the password from seeing it in the database
nameSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

//Making a mongoose model with the name schema
var User = mongoose.model("User", nameSchema);

//If this save to the database was successful it will return to the .then segment of the promise. 
app.post("/projects", (req, res) => {
    var myData = new User(req.body);
    var userData = req.body.username;
    var passwordData = req.body.password;

    myData.save()
       .then(item => {
          if(userData == "meiMapping" && passwordData == "meiMapping")
            res.render('projects', { title: 'Express' });
          else
            res.status(400).send("Wrong Username/password. Try again.");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

/////DATABASE FOR PROJECTS:
//Change this line to the database you want the user name and password to be posted to
var mongooseProject = mongoose.connect("mongodb://localhost:27017/projectsDatabase");

//Testing the database for userDatabase schema:
var projectSchema = new mongoose.Schema({
    project: String
});
//Making a mongoose model with the name schema
var Projects = mongoose.model("Projects", projectSchema);

//If this save to the database was successful it will return to the .then segment of the promise. 
app.post("/meiMapping", (req, res) => {
    var myData = new Projects(req.body);
    myData.save()
        .then(item => {
            res.render('index', { title: 'Express' });
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

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
app.use('/projects', projectRouter);
app.use('/notes', noteRouter);

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

//Enable CORS for all HTTP methods
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

module.exports = app;
