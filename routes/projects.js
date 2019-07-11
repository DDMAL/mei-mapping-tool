var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))
//Arrays for the neumes and the users
global.neumeFinal = []; //getting all the neumes from the project
global.userFinal = []; //The user needs to be added in all the routes
global.latestImage = []; //getting the latestImage from the database

//build the REST operations at the base for projects
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router.route('/')
    //GET all projects
    //Get all the neumes from the database : 
    .get(function(req, res, next) {
      projectIds = req.body._id;
      mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                    userFinal = users;
                   // console.log(userFinal);//This works!!!
                  });
        //retrieve all projects from Mongo
        mongoose.model('project').find({userID : req.session.userId}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                console.log(project._id);
               
                mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
                  neumeFinal = neumes;
                  //console.log(neumeFinal);//This works!!!
                });
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function(){
                      console.log(userFinal);
                        res.render('projects/index', {
                              title: 'Projects',
                              "projects" : projects,
                              "users" : userFinal
                          });
                    },
                    //JSON response will show all projects in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
              global.userFinal = []; //The user needs to be added in all the routes

        });

    })

    //PUT to update a project by ID
  .put(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page

      //find the document by ID
      mongoose.model('project').findById(req.id, function (err, project) {
          //update it
          project.update({
              name : name,
              folio : folio,
              description : description,
              classification : classification,
              mei : mei,
              dob : dob,
              imagePath : editArray //adding the image to the image array without reinitializng everything
          }, function (err, projectID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/projects/");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
             }
             //Deletes the file from the folder
             if(req.body.image == "deleted"){
             const fs = require('fs');

              fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                if (err) throw err;
                console.log('successfully deleted');
              }); }
          })
      });
  })

    //POST a new project
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var projectUserID = req.session.userId;
        var projectArray = [];
        projectArray.push(projectUserID)
        //console.log(projectUsername); //This is undefined. 
        //call the create function for our database
        mongoose.model('project').create({
            name : name,
            userID : projectArray //This will be the userID
             
        }, function (err, project) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
                  neumeFinal = neumes;
                  //console.log(neumeFinal);//This works!!!
                });
                mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                userFinal = users;
               // console.log(userFinal);//This works!!!
              });
                  //project has been created
                  console.log('POST creating new project: ' + project);
              
                  //project requests for the images inside of projects
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page redirecting to classifier project page
                        res.redirect("/projects");
                    },
                    //JSON response will show the newly created project
                    json: function(){
                        res.json(project);
                    }
                });
              }
        })
    });

/* GET New project page. */
router.get('/new', function(req, res) {
     res.render('projects/new', { title: 'Add New project' });
     //Adding the new names lines
});

/* GET New project page. */
router.get('/:id/new', function(req, res) {
     res.render('projects/newNeume', { title: 'Add New project'});
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('project').findById(id, function (err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
          mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
            neumeFinal = neumes;
            //console.log(neumeFinal);//This works!!!
          });
          mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                userFinal = users;
               // console.log(userFinal);//This works!!!
              });
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(project);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('projects/:id/edit')
  //GET the individual project by Mongo ID
  .get(function(req, res) {
      //search for the project within Mongo
      mongoose.model('project').findById(req.id, function (err, project) {
          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
              //Return the project
              console.log('GET Retrieving ID: ' + project._id);
              var projectdob = project.dob.toISOString();
              projectdob = projectdob.substring(0, projectdob.indexOf('T'))
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.redirect("/projects/")
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(project);
                   }
              });
          }
      }).populate('image').exec((err, posts) => {
      console.log("Populated Image " + posts);
    });
  })
  //PUT to update a project by ID
  .put(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var name = req.body.projectName;
      console.log(name);//this isnt shown
      //find the document by ID
      mongoose.model('project').findById(req.id, function (err, project) {
          
          project.update({
              name : name
          }, function (err, projectID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/projects/");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
             }
             //Deletes the file from the folder
             if(req.body.image == "deleted"){
             const fs = require('fs');

              fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                if (err) throw err;
                console.log('successfully deleted');
              }); }
          })
      });
  })
  //DELETE a project by ID
  .delete(function (req, res){
      //find project by ID
      mongoose.model('project').findById(req.id, function (err, project) {
          if (err) {
              return console.error(err);
          } else {
              //remove it from Mongo
              project.remove(function (err, project) {
                  if (err) {
                      return console.error(err);
                  } else {
                      //Returning success messages saying it was deleted
                      console.log('DELETE removing ID: ' + project._id);
                      mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
                        neumeFinal = neumes;
                        //console.log(neumeFinal);//This works!!!
                      });
                      mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                        userFinal = users;
                       // console.log(userFinal);//This works!!!
                      });
                      res.format({
                          //HTML returns us back to the main page, or you can create a success page
                            html: function(){
                                 res.redirect("/projects");
                           },
                           //JSON returns the item with the message that is has been deleted
                          json: function(){
                                 res.json({message : 'deleted',
                                     item : project
                                 });
                           }
                        });
                  }
              });
          }
      });
  });
//build the REST operations at the base for projects
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router.route('/projects')
    //GET all projects
    .get(function(req, res, next) {
        //retrieve all projects from Monogo
        mongoose.model('project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function(){
                        res.render('projects/index', {
                              title: 'projects',
                              "projects" : projects
                          });
                    },
                    //JSON response will show all projects in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
        });
    })

    //POST a new project
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var folio = req.body.folio;
        var description = req.body.description;
        var classification = req.body.classification;
        var mei = req.body.mei;
        var dob = req.body.dob;

        //call the create function for our database
        mongoose.model('project').create({
            name : name,
            folio : folio,
            description : description,
            classification : classification,
            mei : mei,
            dob : dob,
            imagePath : imageArray
            
             
        }, function (err, project) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //project has been created
                  console.log('POST creating new project: ' + project); //project holds the new project
              
                  //project requests for the images inside of projects
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page
                        res.redirect("/projects/" + projectID);
                    },
                    //JSON response will show the newly created project
                    json: function(){
                        res.json(project);
                    }
                });
                imageArray = [];
              }
        })
    });

// route middleware to validate :id
router.param('/project/id', function(req, res, next, id) {
  global.projectIds = id;
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('project').findById(id, function (err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(project);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/project/:id')//Doesnt lead to the projects page, see projects/:id for the projects

  .get(function(req, res) {
    mongoose.model('project').findById(req.id, function (err, project) {

      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
     
        console.log('GET Retrieving ID: ' + project._id);
        mongoose.model('neume').find({ project : project._id}, function (err, neumes) {
        global.ArrayNeumes = [];
            ArrayNeumes.push(neumes);
            console.log(ArrayNeumes);
      });
        var projectdob = project.dob.toISOString();
        projectdob = projectdob.substring(0, projectdob.indexOf('T'))
        res.format({
          html: function(){
              res.render('projects/show', {
                "projectdob" : projectdob,
                "project" : project,
                "neumes" : ArrayNeumes
              });
          },
          json: function(){
              res.json(project);
          }
        });
      }
    });
    console.log(project._id);
  });


router.route('/project/:id/edit')
  //GET the individual project by Mongo ID
  .get(function(req, res) {
      //search for the project within Mongo
      mongoose.model('project').findById(req.id, function (err, project) {
          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
              //Return the project
              console.log('GET Retrieving ID: ' + project._id);
              var projectdob = project.dob.toISOString();
              projectdob = projectdob.substring(0, projectdob.indexOf('T'))
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.render('projects/edit', {
                            title: 'project' + project._id,
                            "projectdob" : projectdob,
                            "project" : project,
                            "projectImages" : project.imagePath
                        });
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(project);
                   }
              });
          }
      }).populate('image').exec((err, posts) => {
      console.log("Populated Image " + posts);
    });
  })
  //PUT to update a project by ID
  .put(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var name = req.body.name;
      var folio = req.body.folio;
      var description = req.body.description;
      var classification = req.body.classification;
      var mei = req.body.mei;
      var dob = req.body.dob;
      global.editArray = [];

      //find the document by ID
      mongoose.model('project').findById(req.id, function (err, project) {
          //update it
          editArray = project.imagePath.concat(imageArray);
          project.update({
              name : name,
              folio : folio,
              description : description,
              classification : classification,
              mei : mei,
              dob : dob,
              imagePath : editArray //adding the image to the image array without reinitializng everything
          }, function (err, projectID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/projects/");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
             }
             //Deletes the file from the folder
             if(req.body.image == "deleted"){
             const fs = require('fs');

              fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                if (err) throw err;
                console.log('successfully deleted');
              }); }
          })
      });
  })
  //DELETE a project by ID
  .delete(function (req, res){
      //find project by ID
      mongoose.model('project').findById(req.id, function (err, project) {
          if (err) {
              return console.error(err);
          } else {
              //remove it from Mongo
              project.remove(function (err, project) {
                  if (err) {
                      return console.error(err);
                  } else {
                      //Returning success messages saying it was deleted
                      console.log('DELETE removing ID: ' + project._id);
                      res.format({
                          //HTML returns us back to the main page, or you can create a success page
                            html: function(){
                                 res.redirect("/projects");
                           },
                           //JSON returns the item with the message that is has been deleted
                          json: function(){
                                 res.json({message : 'deleted',
                                     item : project
                                 });
                           }
                        });
                  }
              });
          }
      });
  });

/////ROUTE FOR THE ID!!!!!
////////////////////////////
/**************************/
router.route('/:id') //This is where the classifier would be
  .get(function(req, res) {
    var projectName = req.body.projectName;
    console.log(projectName);
    global.nameOfProject = projectName;
  
    mongoose.model('project').findById(req.id, function (err, project) {

      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        //Updating the name
        //Getting the neumes for each project and showing them in the console!!
        //Element in face
        console.log(project._id);
           mongoose.model('User').find({_id : req.session.userId}, function (err, users) { 
                userFinal = users;
               // console.log(userFinal);//This works!!!
              });
           //console.log(userFinal);//This works! 
           mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
            neumeFinal = neumes;
            //console.log(neumeFinal);//This works!!!
          });
           mongoose.model('image').findOne({}, {}, { sort: { 'created_at' : -1 } }, function(err, latestImage) {
              console.log( latestImage );
              latestImage = image;
            });
          // console.log(neumeFinal);
        console.log('GET Retrieving ID: ' + project._id);
        var projectdob = project.dob.toISOString();
        projectdob = projectdob.substring(0, projectdob.indexOf('T'))
        
        res.format({
          html: function(){
            console.log(neumeFinal); //This is shown on the console!
            console.log(userFinal)//This is shown on the console!
            
              res.render('projects/show', {
                "projectdob" : projectdob,
                "project" : project,
                "neumes" : neumeFinal,
                "users" : userFinal,
                "image" : latestImage

              });
          },
          json: function(){
              res.json(project);
          }
        });
      }
    });
  });

  router.route('/public/:id') //This is where the classifier would be
  .get(function(req, res) {
    var projectName = req.body.projectName;
    console.log(projectName);
    global.nameOfProject = projectName;
  
    mongoose.model('project').findById(req.id, function (err, project) {

      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        //Updating the name
        //Getting the neumes for each project and showing them in the console!!
        //Element in face
           //console.log(userFinal);//This works! 
           mongoose.model('neume').find({project : project._id}, function (err, neumes) { 
            neumeFinal = neumes;
            //console.log(neumeFinal);//This works!!!
          });
          // console.log(neumeFinal);
        console.log('GET Retrieving ID: ' + project._id);
        var projectdob = project.dob.toISOString();
        projectdob = projectdob.substring(0, projectdob.indexOf('T'))
        
        res.format({
          html: function(){
            console.log(neumeFinal); //This is shown on the console!
            console.log(userFinal)//This is shown on the console!
            
              res.render('neumes/show', {
                "projectdob" : projectdob,
                "project" : project,
                "neumes" : neumeFinal
              });
          },
          json: function(){
              res.json(project);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	//GET the individual project by Mongo ID
	.get(function(req, res) {
	    //search for the project within Mongo
	    mongoose.model('project').findById(req.id, function (err, project) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/projects/" + req.id);
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
	        }
	    })
	})

  //Used to get the updated name of the project!
	//PUT to update a project by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes from the edit page
	    var projectName = req.body.nameProject; //Its getting the information from the edit page
      console.log(projectName); 

	    //find the document by ID
	    mongoose.model('project').findById(req.id, function (err, project) {
	        //update it
	        project.update({ //This works, it's just the element from the page that isn't sent over.
	            name : projectName
	            
	        }, function (err, projectID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          } 
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/projects/" + project._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(project);
	                     }
	                  });
	           }
	        })
	    });
	})
	//DELETE a project by ID
	.delete(function (req, res){
	    //find project by ID
	    mongoose.model('project').findById(req.id, function (err, project) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            project.remove(function (err, project) {
	                if (err) {
	                    return console.error(err);
	                } else {
                    mongoose.model('neume').remove({project : project._id}).exec();
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + project._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/projects");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : project
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});
module.exports = router;