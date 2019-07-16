var express = require('express');
var router = express.Router();
var User = require('../model/User');
var path = require('path');
var bodyParser = require('body-parser');
var alert = require('alert-node');

global.userArray = [];
global.userArray = [];
 
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

//Route to update the bio
router.route('/updateBio')
  //PUT to update a neume by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var bio = req.body.bio;

      //find the document by ID
      User.findById(req.session.userId)
         .exec(function (error, user) {
          //update it
          user.update({
              bio : bio //adding the image to the image array without reinitializng everything
          }, function (err, user) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(user);
                       }
                    });
             }
          })
      });
  })
//Route to update the bio
router.route('/updateSettings')
  //post to update our settings by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var userSettings = req.body.usernameSettings;
      var emailSettings = req.body.emailSettings;

      //find the document by ID
      User.findById(req.session.userId)
         .exec(function (error, user) {
          //update it
          user.update({
              username : userSettings,
              email : emailSettings

          }, function (err, user) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(user);
                       }
                    });
             }
          })
      });
  })
//Route to add a collab
router.route('/collabs')
  //PUT to update a neume by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var userCollab = req.body.collabName;
      var project = req.body.project;
      var userCollabName;
      var projectCollabName;
      //Here, I also want to call the project schema model and ask for adding the name or the id of the element in the neume. 
      //Project schema : needs to be found by project id, then I add the user id of the user I just added to the project
      //to the array of the userID.
            //This works, when the page is reloaded
            mongoose.model('project').findOneAndUpdate({_id: project}, 
              {
                $push: {userID : userCollab}}, 

              function(err, data){
                console.log(err, data);
              });

      //Get the username from searching the database with the id
      //Do the same thing for the project name

      mongoose.model('project').findById(project, function (err, project) { 
                projectCollabName = project.name;
                console.log(projectCollabName);//This works!!!
              });

      mongoose.model('User').findById(userCollab, function (err, user) { 
                userCollabName = user.username;
               console.log(userCollabName);//This works!!!
              });

      //find the document by ID
      User.findById(req.session.userId)
         .exec(function (error, user) {
          //update it
          user.update({
              $push : {
                        collaborators :  {
                                 nameCollab: userCollab,
                                 projectID: project,
                                 collabUserName : userCollabName,
                                 collabProjectName : projectCollabName
                               } //inserted data is the object to be inserted 
                      }
          }, function (err, user) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(user);
                       }
                    });
             }
          })
      });
  })

//route to delete a collab
router.route('/deleteCollab')
  //DELETE an image by ID
  .post(function (req, res){

    var userCollab = req.body.collabName; 
    var projectCollab = req.body.collabProject;
    
      mongoose.model('User').findById(req.session.userId, function (err, user) {

          if (err) {
              return console.error(err);
          } else {
            //This works, when the page is reloaded
            mongoose.model('User').findOneAndUpdate({_id: user._id}, 
              {
                $pull: {collaborators :  {
                                 nameCollab: userCollab,
                                 projectID: projectCollab
                               } //inserted data is the object to be inserted 
                             }}, 

              function(err, data){
                console.log(err, data);
              });

            //Deleting the element from the userArray
            for( var i = 0; i < userArray.length; i++){ 
                 if ( userArray[i] === userCollab) {
                   userArray.splice(i, 1); 
                 }
              }
        
              res.format({
                  //HTML returns us back to the main page, or you can create a success page
                    html: function(){
                        //res.redirect("back");
                        res.redirect("back");
                   },
                   //JSON returns the item with the message that is has been deleted
                  json: function(){
                         res.json({message : 'deleted',
                             item : user
                         });
                   }

                });
                  }
              });
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
      bio : req.body.bio
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
  var usersSelect = [];
  global.projectsUsers = [];
    mongoose.model('project').find({userID : req.session.userId}, function (err, projects) {
                if (err) {
                    return console.error(err);
                } 
                else { 
                  projectsUsers = projects;
              }});
    mongoose.model('User').find({}, function (err, users) {
                if (err) {
                    return console.error(err);
                } 
                else { usersSelect = users;

                }});

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
          
         return res.format({
          html: function(){           
              res.render('profile', {
                "username" : user.username,
                "email" : user.email,
                "status" : user.role,
                "bio": user.bio,
                "collaborators" : user.collaborators,
                "users" : usersSelect,
                "projects" : projectsUsers
              });
          },
          json: function(){
              res.json(project);
          }
        });
        }
      }
    });
});
// Update the information on the database
router.post('/profile', function (req, res, next) {
 
      var username = req.body.name;
      var email = req.body.email;
      var bio = req.body.bio;
      var collaborators = req.body.collaborators;

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
         return res.format({
          html: function(){           
            res.redirect("back");
          },
          json: function(){
              res.json(project);
          }
        });
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