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
var storedImages = require('../model/storedImages');

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
          var err = new Error('No account with that email address exists.');
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
      var err = 'Success!! The email has been sent!';
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
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

//Route for the email reset link
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      var err = new Error('Password reset token is invalid or has expired.');
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
          var err = new Error('Password reset token is invalid or has expired.');
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
  //Update the sections to add neumes inside. 
  router.route('/updateSection')
  .post(function(req, res) {


    var neumeSectionIds = [];
    neumeSectionIds.push(req.body.neumeSectionIds); //This is an array of elements
    var sectionID = req.body.SectionID;
    var sectionName = req.body.sectionName;

      mongoose.model('section').findOneAndUpdate({_id: sectionID}, 
                            {
                              //push the neumes into the imagesBinary array
                              neumeIds : neumeSectionIds}, 

        function(err, data){
          if(err){
            console.log(err);
          }

          else{
              console.log(data);

              neumeSectionIds.forEach(function(neumeID){

                mongoose.model('neume').findOneAndUpdate({_id : neumeID},
                  {
                      //push the neumes into the imagesBinary array
                      neumeSection : sectionID, 
                      neumeSectionName : sectionName},

                 function (err, neume) { 

                  if(err){
                    console.log(err)
                  }
                  else{
                    console.log(neume);
                  }
                
                  });
              })
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function(){
                      console.log(userFinal);
                        res.redirect("back");
                    },
                    //JSON response will show all projects in JSON format
                    json: function(){
                        res.json(projects);
                    }
                }); 


          }

      });
                  
              //global.userFinal = []; //The user needs to be added in all the routes

});

router.route('/savePosition')
  .post(function(req, res) { 

  //We want to get all the neumes from the mongoose.model, and for each neume in neumes
  //update the position field from the req.body.position of each neume. (maybe the position will be the same, 
  //or, we could make the name of the field as position#{neume.id} so that the position would be updated
  //to the position if id = #{neume.id})

  // Get our REST or form values. These rely on the "name" attributes from the edit page
      var position = req.body.position;
      var projectID = req.body.projectIDPosition;

      //find the document by ID
      mongoose.model('project').findById(projectID, function (err, project) {
          //update it
          project.update({
              positionArray : position //adding the image to the image array without reinitializng everything
          }, function (err, project) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {console.log(project.positionArray);
             }
          })
         //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
         })

  });

router.route('/section')
  .post(function(req, res) { 

  //We want to get the sections collection and add a new section with the 2 neumes inside.

  // Get our REST or form values. These rely on the "name" attributes from the edit page
      var name = req.body.nameSection;
      var projectID = req.body.ID_project;

      //find the document by ID
       //call the create function for our database
        mongoose.model('section').create({
            name : name,
            projectID : projectID

        }, function (err, section) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                //Now, we must add section._id for each neume in their sectionNeume
                  //This works, it sends the id of the section to the neume
                  //console.log('POST creating new neume: ' + neume); //neume holds the new neume
                  //
         //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(neume);
                       }
                    });
                  }
                });
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
          else {
            return res.download(filePath);
          }
        });

      }
    })//global.userFinal = []; //The user needs to be added in all the routes

  });

var multer  = require('multer')
var uploadCSV = multer({ dest: 'exports/' })
router.route('/uploadCSV')
.post(uploadCSV.single('csvFile'), function(req, res) {

  var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
  var nameOfProject = req.body.projectName;
  var csvParser = require('csv-parse');
  var file = req.file.buffer;

  const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
      var fs = require('fs');
          var dir = './exports';

          if (!fs.existsSync(dir)){
              fs.mkdirSync(dir);
          }
      fs.writeFile(filePath, file, function (err) {
          console.log(file); //This is just the name
      }); 

        const csv = require('csvtojson');

      csv()
      .fromFile(req.file.path)
      .then((jsonObj)=>{

          mongoose.model("neume").insertMany(jsonObj)
            .then(function(jsonObj) {

              jsonObj.forEach(function(neume){
                mongoose.model("neume").find({_id : neume.id}).update({
                      project : IdOfProject
                    }, function (err, neumeElement) {
                      if (err) {
                          res.send("There was a problem updating the information to the database: " + err);
                      } 
                      else {console.log(neumeElement);
                       }
                    })

              })




                res.redirect("back");
            })
            .catch(function(err) {
              err = "Please, only upload the csv file downloaded from the project."
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
            });
        });
      })

var multer  = require('multer')
var uploadCSV = multer({storage: multer.diskStorage({
    destination: function (req, file, callback) { callback(null, './exports');},
    filename: function (req, file, callback) { callback(null, file.originalname);}})
}).single('fileImage');
router.route('/imageCSV')
.post(uploadCSV, function(req, res) {

  var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
  var nameOfProject = req.body.projectName;

 //1. I need to upload the excel file here
     var originalFileName = req.file.originalname;
     console.log(originalFileName);
     node_xj = require("xls-to-json");
  node_xj({
    input: req.file.path,  // input xls
    output: "output.json", // output json // specific sheetname
    rowsToSkip: 0 // number of rows to skip at the top of the sheet; defaults to 0
  }, function(err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log("works");
      mongoose.model("neume").insertMany(result)
            .then(function(jsonObj) {

              jsonObj.forEach(function(neume){
                mongoose.model("neume").find({_id : neume.id}).update({
                      project : IdOfProject,
                      classifier : originalFileName
                      //I also need to add the classifier name as a field
                    }, function (err, neumeElement) {
                      if (err) {
                          res.send("There was a problem updating the information to the database: " + err);
                      } 
                      else {console.log(neumeElement);
             

 //2. I need to unzip the file and add the unzipped content to a directory
    var unzip = require('unzip');
    fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({ path: './exports' }));
    //We now have all the folders from the zip file into the exports folder.
 //3. I need to go to dir/xl/media to get all the images
    //passsing directoryPath and callback function
    fs.readdir("./exports/xl/media", function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        var indice = 1;
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            var fileNameIndice = "image" + indice + ".png";
            file.filename = "image" + indice + ".png";
            
            //This part here works well.
            //4. I need to add the images to the neumes by image name "image01, ect..."
               //4.1 For each .png in the folder, change to binary file and add to mongoose find first neume, ect..
               mongoose.model("neume").find({classifier : originalFileName}, function (err, neumes) {

               //Then for each neume add a field called  indice + 'png'
               indice = 0;
               neumes.forEach(function(neume){
                indice += 1;
                var indiceValue = "image" + indice + ".png";
                
          //update it
          mongoose.model('neume').find({_id : neume._id}).update({
              indice : "image" + indice + ".png" //adding the image to the image array without reinitializng everything
          }, function (err, neume1) {

            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
              //if(file.name == neume.field)
             //if(neume.indice == fileNameIndice){
                var imgPath = 'exports/xl/media/' + indiceValue; //This is undefined. 

                    // our imageStored model
                        var A = storedImages;
                    // store an img in binary in mongo
                        var a = new A;
                        a.neumeID = neume._id;
                        a.img.data = fs.readFileSync(imgPath);
                        a.img.contentType = 'image/png';
                        a.imgBase64 = a.img.data.toString('base64');
                        var imageData = [];
                        imageData.push(a.img.data.toString('base64'));//This works for all the images stored in the database.

                    //All the images (images) need to be pushed to an array field in mongodb
                        mongoose.model('neume').find({_id : neume._id}).update( 
                        {
                          //push the neumes into the imagesBinary array
                          imagePath : imgPath,
                          imagesBinary : imageData}, 

                        function(err, data){
                          //console.log(err, data);
                          imageData = [];
                        

           
                        a.save(function (err, a) {
                          if (err) throw err;

                          console.error('saved img to mongo');
                        });
                        });

              
             //}
                  //push the file in binary to the neume.imagesBinary
                  //Create a new document for the image with field neumeID as the neumeID
                  //Also needs a imgBase64 as a field. 

               //inside the for each : indice++;
               //mongoose.update
               //When this is done, res.redirect back
               

              console.log(project.positionArray);

             }
             })
          })
         //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    
         });

            console.log(file); 
        });

    });
          }
                })

          })
        })
      }
    });

 //4. I need to add the images to the neumes by image name "image01, ect..."
   //4.1 For each .png in the folder, change to binary file and add to mongoose find first neume, ect..
//5. Redirect the page to the project page
     res.format({
                  html: function(){
                             res.redirect("back");
                       },
                       //JSON responds showing the updated values
                  json: function(){
                             res.json(project);
                       }
                    });
      }); 


       //Keep information for the classifier file here. 
       //the folder should be added in a separate input
       //In the folder, only keep the .png images
       //They are labeled as image068.png
  /*node_xj = require("xls-to-json");
  node_xj({
    input: req.file.path,  // input xls
    output: "output.json", // output json // specific sheetname
    rowsToSkip: 0 // number of rows to skip at the top of the sheet; defaults to 0
  }, function(err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log("works");
      mongoose.model("neume").insertMany(result)
            .then(function(jsonObj) {

              jsonObj.forEach(function(neume){
                mongoose.model("neume").find({_id : neume.id}).update({
                      project : IdOfProject
                    }, function (err, neumeElement) {
                      if (err) {
                          res.send("There was a problem updating the information to the database: " + err);
                      } 
                      else {console.log(neumeElement);
                       }
                    })

              })*/

              //What I need to do for tomorrow : 

              //1. Get the images from the input name = images and add them to a folder created here
              //2. Change the images to base 64 and add them to the storageImages collection
              //3. Show the images in the neumes depending on the order in their name (001, 002, ect..)

              //This takes the xls files and adds them to the neumes. 
              //But without the neume images since the xls to json changes the images binary to nothing.
             /*var base64 = require('file-base64');
               
              base64.encode(req.file.path, function(err, base64String) {

                var Base64 = require('js-base64').Base64;
                var json = Base64.decode(base64String); 
                console.log(json);
              });

                res.redirect("back");
            })*/
  //  }
 // });

//})

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
      const filePath = pathName.join(__dirname, "..", "exports", "csv-" + IdOfProject + "_" + dateTime + ".csv")
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
      var userCollabName;
      var projectCollabName;

      //Here, I also want to call the project schema model and ask for adding the name or the id of the element in the neume. 
      //Project schema : needs to be found by project id, then I add the user id of the user I just added to the project
      //to the array of the userID.
            //This works, when the page is reloaded
            mongoose.model('project').findOneAndUpdate({_id: project}, {$push: {userID : userCollab}})
                  .exec(function (err, data) {
                
                if(data.admin == userCollab){
                  //find the document by ID
                      var err = new Error('The collaborator you want to add is the admin of the project. You cannot add them again as a collaborator.');
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
                else{
                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                  //This is not being updated
                 // data.update(
                   //{ $push: { userID : userCollab } }); 


      //Get the username from searching the database with the id
      //Do the same thing for the project name

      mongoose.model('project').findById(project, function (err, project) { 
                projectCollabName = project.name;
                console.log(projectCollabName);//This works!!!
              });

      mongoose.model('User').findById(userCollab, function (err, user) { 
                userCollabName = user.username;
               console.log(userCollabName);//This works!!!
           

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
      });  
      }; 
  })
                });

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
                        res.redirect("/profile");
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
      bio : req.body.bio,
      active : false
    }
    User.findOne({ $or:[{username : req.body.username}, {email : req.body.email}] })
        .exec(function (err, user) {
          if (err) {
            return dialog.info("error");
          } else{

            if(user == null){
            //find the document by ID
                User.findById(req.session.userId)
                   .exec(function (error, user) {
                    //update it
                    User.create(userData, function (err, user) {
                      if (err) {
                          res.send("There was a problem updating the information to the database: " + err);
                      } 
                      else {
    async.waterfall([
    function(done) {
      crypto.randomBytes(30, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {

        user.password = req.body.password;
        user.activeToken = token;
        user.active = false;
        user.resetActiveTokendExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });

    },
    function(token, user, done) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: 'cress-noreply@demo.com',
        subject: 'Cress Confirmation Email',
        text:'You are receiving this because you have created an account with Cress.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process and activate your account:\n\n' +
          'http://' + req.headers.host + '/confirm/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your account will be deleted automatically.\n',
        html: '<strong>You are receiving this because you have created an account with Cress. Please click on the following link, or paste this into your browser to complete the process and activate your account: http://' + req.headers.host + '/confirm/' + token + '  . If you did not request this, please ignore this email and your account will be deleted. </strong> ',
      };
      sgMail.send(msg);
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
                      var err = 'Success! A confirmation email has been sent to your email. Please confirm your email before logging-in.';
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
                });
          }
          else{
           var err = new Error('Email/Username already taken. Please try again');
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
  
    

  } else if (req.body.logemail && req.body.logpassword) {
      
      User.authenticateByEmail(req.body.logemail, req.body.logpassword, function (error, user) {

      if (error || !user) {
        User.authenticateByUsername(req.body.logemail, req.body.logpassword, function (error, username) {
          console.log(username); //This is undefined
        if (error || !username) {
          var err = new Error('Wrong email/username or password. Please try again.'); //When entering the right email/user/password, this is going on.
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
          if(username.active == false){
          var err = new Error('Account not activated. To activate your account, a confirmation email has been sent to you. Please confirm your account before proceeding.');
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

          req.session.userId = username._id;
          return res.redirect('/projects');
        }

    }); 
      }else {
        if (user.role == "editor"){
          req.session.userId = user._id;
        return res.redirect('/projects');}
        if(user.active == false){
          var err = new Error('Account not activated. To activate your account, a confirmation email has been sent to you. Please confirm your account before proceeding.');
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

router.get('/confirm/:token', function(req, res) {
  User.findOneAndUpdate({ activeToken: req.params.token, resetActiveTokendExpires: { $gt: Date.now() } }, {active : true}, function(err, user) {
    if (!user) {
      var err = new Error('Confirmation reset token is invalid or has expired.');
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
    var err = 'Success! Your account has been activated, you can now log-in to Cress.';
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
  });
});
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