var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/meiMapping', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Userlist page. */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('user', {
            "user" : docs
        });
    });
});

/* GET Userlist page. */
router.get('/projects', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('projects', {
            "projects" : docs
        });
    });
});

/* GET Userlist page. */
router.post('/projects', function(req, res) {
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userPass = req.body.password;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "Password" : userPass
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("projects");
        }
    });

    });


module.exports = router;
