var express = require('express');
var router = express.Router();
var User = require('../model/user');
var path = require('path');
var bodyParser = require('body-parser');

var alert = require('alert-node');
 
router.use(bodyParser.urlencoded({ extended: true }));
// GET route for reading data
router.get('/', function (req, res, next) {
  return res.render('index');
});
/* GET New project page. */
router.get('/about', function(req, res) {
     res.render('about', { title: 'About' });
     //Adding the new names lines
});

//POST route for updating data
router.post('/', function (req, res, next) {
  var editor = false;
  
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    }
  
    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        if(req.body.role == "editor")
          return res.redirect("/projects");
        return res.redirect('/projects');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
      
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password. Please try again.');
        alert(err, 'yad');
        return res.redirect('back');
      } else {
        if (user.role == "editor"){
          req.session.userId = user._id;
        return res.redirect('/projects');}

        req.session.userId = user._id;
        return res.redirect('/projects');
      }

    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;