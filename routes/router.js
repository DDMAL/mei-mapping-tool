var express = require('express');
var router = express.Router();
var User = require('./model/user');
var path = require('path');
var bodyParser = require('body-parser');
var alert = require('alert-node');
 
router.use(bodyParser.urlencoded({ extended: true }));
// GET route for reading data
router.get('/', function (req, res, next) {
  return res.render('index');
});
var userFinal = [];
/* GET about page. */
router.route('/about')
  .get(function(req, res) {
      mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                    userFinal = users;
                  });
                mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                userFinal = users;
               // console.log(userFinal);//This works!!!
              });
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function(){
                      console.log(userFinal);
                        res.render('about.jade', {
                              title: 'About',
                              "users" : userFinal
                          });
                    },
                    //JSON response will show all projects in JSON format
                    json: function(){
                        res.json(projects);
                    }
                }); 
              //global.userFinal = []; //The user needs to be added in all the routes

});

//POST route for updating data
router.post('/', function (req, res, next) {
  var editor = false;
  
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match. Try again');
    alert(err, 'yad');
    return res.redirect('back');
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
        var err = new Error('Username or Email already used. Please try again.');
        alert(err, 'yad');
        return res.redirect('back');
      } else {
        req.session.userId = user._id;
        if(req.body.role == "editor")
          return res.redirect("/projects");
        return res.redirect('/projects');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
      
    User.authenticateByEmail(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        User.authenticateByUsername(req.body.logemail, req.body.logpassword, function (error, username) {
          console.log(username);
        if (error || !username) {
          var err = new Error('Wrong email/username or password. Please try again.');
          alert(err, 'yad');
          return res.redirect('back');
        } else {
          req.session.userId = username._id;
          return res.redirect('/projects');
        }

    }); 
      }else {
        if (user.role == "editor"){
          req.session.userId = user._id;
        return res.redirect('/projects');}

        req.session.userId = user._id;
        return res.redirect('/projects');
      }

    });
  } else {
    var err = new Error('All fields are required.');
        alert(err, 'yad');
        return res.redirect('back');
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        alert(error, 'yad');
        return res.redirect('back');
      } else {
        if (user === null) {
          var err = new Error('Not Authorized.');
        alert(err, 'yad');
        return res.redirect('back');
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