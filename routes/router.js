var express = require('express');
var router = express.Router();
var User = require('../model/User');
var path = require('path');
var bodyParser = require('body-parser');
var alert = require('alert-node');
const moment = require('moment');
const mdq = require('mongo-date-query');
const pathName = require('path'); //Already 
const json2csv = require('json2csv').parse;
const fields = ['imagePath', 'imagesBinary', 'name', 'folio', 'description', 'classification', 'mei', 'review', 'dob', 'project'];
global.userArray = [];
global.userArray = [];
var dialog = require('dialog');
var session = require('express-session')
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var flash = require('express-flash');

router.use(flash()); 
router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// GET route for reading data
router.get('/', function (req, res, next) {
  return res.render('index');
});
var userFinal = [];

/*Forget Password Page*/

router.get('/forgot', function(req, res) {
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
              res.render('forgot', {
                "username" : user.username,
                "email" : user.email
              });
          },
          json: function(){
              res.json(project);
          }
        });

        }
        }});
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          dialog.info('No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: 'cress-noreply@demo.com',
        subject: 'Cress Password Reset',
        text:'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        html: '<strong>You are receiving this because you (or someone else) have requested the reset of the password for your account.  Please click on the following link, or paste this into your browser to complete the process: http://' + req.headers.host + '/reset/' + token + '  . If you did not request this, please ignore this email and your password will remain unchanged. </strong> ',
      };
      sgMail.send(msg);
      res.status(204).send();
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

//Route for the email reset link
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

//Reset route for posting the new password
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          res.redirect('/');
        });
      });
    }]);
    /*function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: '!!! YOUR SENDGRID USERNAME !!!',
          pass: '!!! YOUR SENDGRID PASSWORD !!!'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }*/
  //], function(err) {
   // res.redirect('/');
 // });
});
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

router.route('/csv')
  .post(function(req, res) {

    var IdOfNeume = req.body.IdOfNeume;
     console.log(IdOfNeume);//This is somehow undefined.

    mongoose.model('neume').findById(IdOfNeume, function (err, neumeCSV) {
      if (err) {
        return res.status(500).json({ err });
      }
      else {
        //var neume = neume;
        console.log(neumeCSV);
        let csv
        try {
          csv = json2csv(neumeCSV, {fields});
        } catch (err) {
          return res.status(500).json({ err });
        }
        const dateTime = moment().format('YYYYMMDDhhmmss');
        const filePath = pathName.join(__dirname, "..", "exports", "csv-" + neumeCSV.name + ".csv")
        var fs = require('fs');
            var dir = './exports';

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        fs.writeFile(filePath, csv, function (err) {//This gives an error
          if (err) {
            return res.json(err).status(500);
          }
          else {setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000)
            return res.download(filePath);
          }
        });

      }
    })//global.userFinal = []; //The user needs to be added in all the routes

  });

router.route('/csvProject')
.post(function(req, res) {

  var IdOfProject = req.body.IdOfProject;
  var nameOfProject = req.body.projectName;

  mongoose.model('neume').find({project : IdOfProject}, function (err, neumeCSV) {
    if (err) {
      return res.status(500).json({ err });
    }
    else {
      //var neume = neume;
      console.log(neumeCSV);
      let csv
      try {
        csv = json2csv(neumeCSV, {fields});
      } catch (err) {
        return res.status(500).json({ err });
      }
      const dateTime = moment().format('YYYYMMDDhhmmss');
      const filePath = pathName.join(__dirname, "..", "exports", "csv-" + nameOfProject + "_" + dateTime + ".csv")
      var fs = require('fs');
          var dir = './exports';

          if (!fs.existsSync(dir)){
              fs.mkdirSync(dir);
          }
      fs.writeFile(filePath, csv, function (err) {//This gives an error
        if (err) {
          return res.json(err).status(500);
        }
        else {setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000)
          return res.download(filePath);
        }
      });

    }
  })//global.userFinal = []; //The user needs to be added in all the routes

});

router.route('/fork')
.post(function(req, res) {

  var IdOfProject = req.body.IdOfProject;
  var nameOfProject = req.body.projectName;

  mongoose.model('neume').find({project : IdOfProject}, function (err, neumeCSV) { //This gets all the neumes from the project
    if (err) {
      return res.status(500).json({ err });
    }
    else {
       mongoose.model('User').findById(req.session.userId, function (err, user) {
                if (err) {
                    return console.error(err);
                } 
                else { 

      //1.We need to create a copy of the project
        var name = user.username + "/" + nameOfProject; //We'll start with the userID added to the name, then we'll change it to the username
        var projectUserID = req.session.userId; 
        var projectArray = [];
        projectArray.push(projectUserID) //3.Add that project to the user. 
        //console.log(projectUsername); //This is undefined. 
        //call the create function for our database
        mongoose.model('project').create({
            name : name,
            userID : projectArray //This will be the userID
             
        }, function (err, project) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //project has been created
                  console.log('POST creating new project: ' + project);
                  //2.1 Get the id of the project we just created
      // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
            neumeCSV.forEach(function(neumeFork) {
            var name = neumeFork.name;
            var folio = neumeFork.folio;
            var description = neumeFork.description;
            var imageArray = neumeFork.imagesBinary;
            var classification 
            = neumeFork.classification;
            var mei = neumeFork.mei;
            var dob = neumeFork.dob;
            var ID_project = project._id;
            var review = neumeFork.review;

            //call the create function for our database
            mongoose.model('neume').create({
                name : name,
                folio : folio,
                description : description,
                classification : classification,
                mei : mei,
                review : review,
                dob : dob,
                imagePath : imageArray,
                project : ID_project

            }, function (err, neume) {
                  if (err) {
                      res.send("There was a problem adding the information to the database.");
                  } else {
                      //neume has been created
                      //console.log('POST creating new neume: ' + neume); //neume holds the new neume
                      //Show neume array
                      //Neume requests for the images inside of neumes
                      mongoose.model('neume').find({project : ID_project}, function (err, neumes) { 
                        neumeFinal = neumes;
                        //console.log(neumeFinal);//This works!!!
                      });
                      var imageData = [];

                      //Saving the images in the database from the uploads folder. (for each images in the imageArray)
                      imageArray.forEach(function(image) {

                        // our imageStored model
                            var A = storedImages;
                        // store an img in binary in mongo
                            var a = new A;
                            a.neumeID = neume._id;//This is the neume id of the element
                            a.img.contentType = 'image/png';
                            a.imgBase64 = image;
                            imageData.push(a.imgBase64);//This works for all the images stored in the database.

                        //All the images (images) need to be pushed to an array field in mongodb
                            mongoose.model('neume').findOneAndUpdate({_id: neume._id}, 
                            {
                              //push the neumes into the imagesBinary array
                              imagesBinary : imageData}, 

                            function(err, data){
                              //console.log(err, data);
                              imageData = [];
                            });

               
                            a.save(function (err, a) {
                              if (err) throw err;

                              console.error('saved img to mongo');
                            });

                      });

                    imageArray = [];

                  }

            })

        })
            res.format({
                        html: function(){
                             res.redirect("/projects/");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(user);
                       }
                    });
        }

    })
        
  }//global.userFinal = []; //The user needs to be added in all the routes
})
};
});
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
//Route to update the username
router.route('/updateUsername')
  //post to update our settings by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the profile settings page
      var userSettings = req.body.usernameSettings;

      //1)First, we need to find whether the username or email is already used.

      User.findOne({ username : userSettings })
        .exec(function (err, user) {
          if (err) {
            return dialog.info("error");
          } else{

            if(user == null){
            //find the document by ID
                User.findById(req.session.userId)
                   .exec(function (error, user) {
                    //update it
                    user.update({
                        username : userSettings

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
          }
          else{
           var err = new Error('Username already taken. Please try again');
          return res.format({
          html: function(){           
              res.render('errorLog', {
                "error" : err,
              });
          },
          json: function(){
              res.json(err);
          }
        });
          }
          }
      });
    
  })

  //Route to update the email
router.route('/updateEmail')
  //post to update our settings by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the profile settings page
      var emailSettings = req.body.emailSettings;

      //1)First, we need to find whether the username or email is already used.
     User.findOne( { email: emailSettings} )
        .exec(function (err, userEmail) {
          if (err) {
            return dialog.info("error");
          } else{
          
          if(userEmail == null){
            //find the document by ID
                User.findById(req.session.userId)
                   .exec(function (error, user) {
                    //update it
                    user.update({
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
          }
          else{
           var err = new Error('Email already taken. Please try again.');
          return res.format({
          html: function(){           
              res.render('errorLog', {
                "error" : err,
              });
          },
          json: function(){
              res.json(err);
          }
        });
          }
          }
      });

      //2)If so, we cannot change the username or email of the user and we need to give the error
      //"Username or Email already used, please use another username or email"
      //using dialog.info('error');!!
    
  })
//Route to add a collab
router.route('/collabs')
  //PUT to update a neume by ID
  .post(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var userCollab = req.body.collabName;
      var project = req.body.project;
      global.userCollabName = "";
      global.projectCollabName= "";
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

    mongoose.model('project').findOneAndUpdate({_id: projectCollab}, 
              {
                $pull: {userID : userCollab}}, 

              function(err, data){
                console.log(err, data);
              });
    
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
        return res.format({
          html: function(){           
              res.render('errorLog', {
                "error" : err,
              });
          },
          json: function(){
              res.json(err);
          }
        });
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
          return res.format({
          html: function(){           
              res.render('errorLog', {
                "error" : err,
              });
          },
          json: function(){
              res.json(err);
          }
        });
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
        return res.format({
          html: function(){           
              res.render('errorLog', {
                "error" : err,
              });
          },
          json: function(){
              res.json(err);
          }
        });
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
             
    mongoose.model('User').find({ _id : { $nin: [req.session.userId] } }, function (err, users) {
                if (err) {
                    return console.error(err);
                } 
                else { usersSelect = users;

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
        }});
     }});
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