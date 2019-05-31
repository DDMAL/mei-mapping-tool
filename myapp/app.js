var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
//var multer = require('multer');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectRouter = require('./routes/projects');
var noteRouter = require('./routes/note.routes')

// Require bcrypt for the password
 bcrypt = require('bcrypt'),
 SALT_WORK_FACTOR = 10;

////THE COLLECTIONS ARE INSTANTIATED AUTOMATICALLY IS MONGODB AFTER YOU'VE MADE A
////NEW SCHEMA AND POST METHOD, NO NEED TO CREATE THEM!

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
    type: String,
    project: String
});

//Sign up schema:
var signUpSchema = new mongoose.Schema({
    newUserName: String,
    newPassword: String,
    newPasswordCheck: String,
    newType: String
});

//neumeSchema
var neumeSchema = new mongoose.Schema({
    images : { data: Buffer, contentType: String },
    value : String,
    name : String,
    folio : String,
    description : String,
    classLabel : String,
    meiSnippet : String
});

//Dropzone schema : 
var dropzoneSchema = new mongoose.Schema({
    images : String,
    link : String
});

//Testing the database for project schema:
var projectSchema = new mongoose.Schema({
    name: String,
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

//Making a mongoose model with the project schema
var Project = mongoose.model("Project", projectSchema);
var db = mongoose.connection;
//If this save to the database was successful it will return to the .then segment of the promise. 
app.post("/projects", (req, res) => {
    var myData = new User(req.body);
    var userData = req.body.username;
    var passwordData = req.body.password;
    var projectData = req.body.project;
    var projectsCollection = db.collection("projects");
    projectsCollection.insertOne( //Project
   {
       project : "Example",
  
   }
)
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

//Making a mongoose model with the neume schema
var Neumes = mongoose.model("neumes", neumeSchema);

app.post("/meiMapping", (req, res) => {
    var neumeData = new Neumes(req.body);
    var neumeCollection = db.collection("neume");
    
    neumeData.save()
       .then(item => {
            res.render('index', { title: 'Express' });
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

//Making a mongoose model with the neume schema
var signUp = mongoose.model("signUp", signUpSchema);

app.post("/", (req, res) => {
    var newUserData = new signUp(req.body);
    
    newUserData.save()
       .then(item => {
            res.render('projects', { title: 'Express' });
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});
//Making a mongoose model with the dropzone schema
var dropzone = mongoose.model("dropzone", dropzoneSchema);

app.post("/dropzoneImages", (req, res) => {
    var dropzoneData = new dropzone(req.body);
    var dropzoneCollection = db.collection("dropzone");
    
    dropzoneData.save()
       .then(item => {
            res.render('index', { title: 'Express' });
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

//Getting the dropzone images and posting them in the meiMapping page 
//app.get('/meiMapping', function(req, res){
       // Neumes.find({},function(err, docs){
                //res.status(200).send({docs:docs});
       // });
        //res.send('test');
//});

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
