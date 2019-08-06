var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
var storedImages = require('../model/storedImages');
var fs = require('fs');
global.neumes_array = [];

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override

//Change this for the users to go to the projects page
router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//I also need a route for making the zip files.
//Route for the cancel button
router.route('/cancel')
    //GET all neumes
    .get(function(req, res, next) {
          imageArray = [];
        //retrieve all neumes from Mongo
        mongoose.model('project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/neumes folder. We are also setting "neumes" to be an accessible variable in our jade view
                    html: function(){
                         res.redirect("back");
                    },
                    //JSON response will show all neumes in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
    });
})

//Route for the users
router.route('/user')
    //GET all neumes
    .get(function(req, res, next) {
        //retrieve all neumes from Mongo
        mongoose.model('project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/neumes folder. We are also setting "neumes" to be an accessible variable in our jade view
                    html: function(){
                        res.render('neumes/user', {
                              title: 'Project',
                              "projects" : projects
                          });
                    },
                    //JSON response will show all neumes in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
        });
    })

//Route for public user's about page
router.route('/about')
    //GET all neumes
    .get(function(req, res, next) {
        //retrieve all neumes from Mongo
        mongoose.model('project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/neumes folder. We are also setting "neumes" to be an accessible variable in our jade view
                    html: function(){
                        res.render('neumes/about', {
                              title: 'About',
                              "projects" : projects
                          });
                    },
                    //JSON response will show all neumes in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
        });
    })
    
//build the REST operations at the base for neumes
//this will be accessible from http://127.0.0.1:3000/neumes if the default route for / is left unchanged
router.route('/')
    //GET all neumes
    .get(function(req, res, next) {
        //retrieve all neumes from Monogo
        mongoose.model('neume').find({}, function (err, neumes) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/neumes folder. We are also setting "neumes" to be an accessible variable in our jade view
                    html: function(){
                        res.render('neumes', {
                              title: 'Neumes',
                              "neumes" : neumes
                          });
                    },
                    //JSON response will show all neumes in JSON format
                    json: function(){
                        res.json(neumes);
                    }
                });
              }     
        });
    })

    //POST a new neume
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var folio = req.body.folio;
        var description = req.body.description;
        var neumeSection = req.body.neumeSection;
        var neumeSectionName = req.body.neumeSectionName;
        
        var classification 
        = req.body.classification;
        var mei = req.body.mei;
        var dob = req.body.dob;
        var ID_project = req.body.ID_project;
        var review = req.body.review;

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
            project : ID_project,
            neumeSection : neumeSection,
            neumeSectionName : neumeSectionName

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
                  //Creating an xml file to store mei for each neume => neume.mei and neume._id for the name of the file
                  //Making the xml files folder if it doesnt exist
                  //Creating and writing the file with the information
                  //Not really important, simply so that the user can have a history of the xml files they have written.

                  // example schema for saving images in the database
                    

                  //Saving the images in the database from the uploads folder. (for each images in the imageArray)
                  imageArray.forEach(function(image) {
                    var imgPath = 'uploads/' + image;

                    // our imageStored model
                        var A = storedImages;
                    // store an img in binary in mongo
                        var a = new A;
                        a.neumeID = neume._id;
                        a.img.data = fs.readFileSync(imgPath);
                        a.img.contentType = 'image/png';
                        a.imgBase64 = a.img.data.toString('base64');
                        imageData.push(a.img.data.toString('base64'));//This works for all the images stored in the database.

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


                  //Using GridFS, we can create a file, find that file in the uploads folder.
                  //Then create a GridFSInputFile set that filename as the new name
                  //Then save the file. 

                  res.format({
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("/projects/" + ID_project);
                        // And forward to success page
                        res.redirect("/projects/" + ID_project);
                    },
                    //JSON response will show the newly created neume
                    json: function(){
                        res.json(neume);
                    }
                });
                imageArray = [];
              }
        })
    });

/* GET New neume page. */
router.get('/new', function(req, res) {
     res.render('neumes/new', { title: 'Add New Neume' });
});

/* Update edit images. */
router.route('/:id/editImage')
  .get(function(req, res) {
      //search for the neume within Mongo
      mongoose.model('neume').findById(req.id, function (err, neume) {
          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
              //Return the neume
              //console.log('GET Retrieving ID: ' + neume._id);
              var neumedob = neume.dob.toISOString();
              neumedob = neumedob.substring(0, neumedob.indexOf('T'))
              imageArray = [];
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.render('neumes/edit', {
                            title: 'neume' + neume._id,
                            "neumedob" : neumedob,
                            "neume" : neume,
                            "neumeImages" : neume.imagePath
                        });
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(neume);
                   }

              });
              imageArray = [];
              res.redirect('back');

          }
      }).populate('image').exec((err, posts) => {
      //console.log("Populated Image " + posts);
    });
  })
  //PUT to update a neume by ID
  .put(function(req, res) {
      // Get our REST or form values. These rely on the "name" attributes from the edit page
      var name = req.body.name;
      var folio = req.body.folio;
      var description = req.body.description;
      var classification = req.body.classification;
      var mei = req.body.mei;
      var review = req.body.review;
      var dob = req.body.dob;
      var projectName = req.body.projectName;
      global.editArray = [];

      //find the document by ID
      mongoose.model('neume').findById(req.id, function (err, neume) {
          var ID_project = neume.project;
          //update it
          editArray = neume.imagePath.concat(imageArray); //This element is added only when the page is reloaded
          neume.update({
              imagePath : editArray //adding the image to the image array without reinitializng everything
          }, function (err, neumeElement) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {

              imageArray.forEach(function(image) {
                    var imgPath = 'uploads/' + image;

                    // our imageStored model
                        var A = storedImages;
                    // store an img in binary in mongo
                        var a = new A;
                        a.neumeID = neume._id;
                        a.img.data = fs.readFileSync(imgPath);
                        a.img.contentType = 'image/png';
                        a.imgBase64 = a.img.data.toString('base64');
                        imageData.push(a.img.data.toString('base64'));//This works for all the images stored in the database.

                    //All the images (images) need to be pushed to an array field in mongodb
                        mongoose.model('neume').findOneAndUpdate({_id: neume._id}, 
                        {
                          //push the neumes into the imagesBinary array
                          $push: {imagesBinary : imageData}}, 

                        function(err, data){
                          //console.log(err, data);
                          imageData = [];
                        });
                        a.save(function (err, a) {
                          if (err) throw err;

                          console.error('saved img to mongo');
                        });

                  });
                  mongoose.model('neume').find({project : ID_project}, function (err, neumes) { 
                        neumeFinal = neumes;
                        //console.log(neumeFinal);//This works!!!
                      });
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
                    imageArray = [];
             }
          })
      });
  })
  //DELETE an image by ID
  .delete(function (req, res){
    //imageDeleted is the path of the image we want to delete.
    var imageToDelete = req.body.imageDeleted;
    //console.log(imageToDelete);
    //This is the p element
     //The image deleted from the page is going to have imageDeleted as a name in the editNeume.jade file
      //req.body.imageDeleted doesnt seem to work
      //find neume by ID
      mongoose.model('neume').findById(req.id, function (err, neume) {
        var ID_project = neume.project;

          if (err) {
              return console.error(err);
          } else {
            //deleting the images from the image model 
              
                //console.log('successfully deleted');
            // mongoose.model('storedImages').remove({imagepath : imageToDelete}, function (err, image) {
                //console.log(image)
             // });
        
              res.format({
                  //HTML returns us back to the main page, or you can create a success page
                    html: function(){
                         res.redirect("back");
                   },
                   //JSON returns the item with the message that is has been deleted
                  json: function(){
                         res.json({message : 'deleted',
                             item : neume
                         });
                   }

                });
              imageArray = [];
                  }
              });
  });

  /* Update edit images. */
router.route('/:id/deleteImage')
  //DELETE an image by ID
  .delete(function (req, res){
    //imageDeleted is the path of the image we want to delete.
    var imageToDelete = req.body.imageDeleted; //this seems to be undefined.

    //This is the p element
     //The image deleted from the page is going to have imageDeleted as a name in the editNeume.jade file
      //req.body.imageDeleted doesnt seem to work
      //find neume by ID
      mongoose.model('neume').findById(req.id, function (err, neume) {
        var ID_project = neume.project;

          if (err) {
              return console.error(err);
          } else {
            //This works, when the page is reloaded
            mongoose.model('neume').findOneAndUpdate({_id: neume.id}, {$pull: {imagesBinary : imageToDelete}}, function(err, data){
                console.log(err, data);
              });

            //remove from neume array the imagepath = imageDeleted
            //deleting the images from the image model 
              //fs.unlink('uploads/' + imageToDelete, (err) => {
                //if (err) throw err;
                //console.log('successfully deleted');
             mongoose.model('storedImages').remove({imgBase64 : imageToDelete}, function (err, data) {
                console.log(err, data)
                //I have to do this now tho
              });
             // });
        
              res.format({
                  //HTML returns us back to the main page, or you can create a success page
                    html: function(){
                        //res.redirect("back");
                        res.status(204).send()
                   },
                   //JSON returns the item with the message that is has been deleted
                  json: function(){
                         res.json({message : 'deleted',
                             item : neume
                         });
                   }

                });
                  }
              });
  });
 

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('neume').findById(id, function (err, neume) {
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
            //console.log(neume);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('neume').findById(req.id, function (err, neume) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        //console.log('GET Retrieving ID: ' + neume._id);
        var neumedob = neume.dob.toISOString();
        neumedob = neumedob.substring(0, neumedob.indexOf('T'))
        res.format({
          html: function(){
              res.render('neumes/show', {
                "neumedob" : neumedob,
                "neume" : neume
              });
          },
          json: function(){
              res.json(neume);
          }
        });
      }
    });
  });
  //The new projectID should be here. 

router.route('/:id/edit')
	//GET the individual neume by Mongo ID
	.get(function(req, res) {
	    //search for the neume within Mongo
	    mongoose.model('neume').findById(req.id, function (err, neume) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the neume
	            //console.log('GET Retrieving ID: ' + neume._id);
              var neumedob = neume.dob.toISOString();
              neumedob = neumedob.substring(0, neumedob.indexOf('T'))
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('neumes/edit', {
	                          title: 'neume' + neume._id,
                            "neumedob" : neumedob,
	                          "neume" : neume,
                            "neumeImages" : neume.imagePath
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(neume);
	                 }
	            });
              res.redirect('back');
	        }
	    }).populate('image').exec((err, posts) => {
      //console.log("Populated Image " + posts);
    });
	})
	//PUT to update a neume by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes from the edit page
	    var name = req.body.name;
	    var folio = req.body.folio;
      var description = req.body.description;
      var classification = req.body.classification;
      var review = req.body.review;
      var mei = req.body.mei;
	    var dob = req.body.dob;
      var projectName = req.body.projectName;
	    global.editArray = [];

	    //find the document by ID
	    mongoose.model('neume').findById(req.id, function (err, neume) {
          var ID_project = neume.project;
	        //update it
          editArray = neume.imagePath.concat(imageArray); //This element is added only when the page is reloaded
	        neume.update({
	            name : name,
	            folio : folio,
              description : description,
              classification : classification,
              mei : mei,
              review : review,
	            dob : dob,
              imagePath : editArray //adding the image to the image array without reinitializng everything
	        }, function (err, neumeID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          } 
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/projects/" + ID_project);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(neume);
	                     }
	                  });
                          //Deletes the file from the folder
      }  
	    });
	})
      })
	//DELETE a neume by ID
	.delete(function (req, res){
	    //find neume by ID
	    mongoose.model('neume').findById(req.id, function (err, neume) {
        var ID_project = neume.project;
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            neume.remove(function (err, neume) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    //console.log('DELETE removing ID: ' + neume._id);
                      mongoose.model('neume').find({project : ID_project}, function (err, neumes) { 
                        neumeFinal = neumes;
                        //console.log(neumeFinal);//This works!!!
                      });
                      // delete file named 'neumeID.xml' I took away this part since you should not be able to remove an xml file from another computer 
                      //If you removed the neume. Since they are deleted from the database, the xml files do not need to be removed from the folder.
                        //fs.unlink("xmlFiles/"+neume._id + '.xml',function(err){
                           // if(err) throw err;

                            //console.log('File deleted!');
                        //});
                        //deleting the images if the neume is deleted
                        /*neume.imagePath.forEach(function(image){
                          fs.unlink('uploads/' + image, (err) => {
                            if (err) throw err;
                            //console.log('successfully deleted');
                         mongoose.model('image').remove({imagepath : image}, function (err, image) {
                            console.log(image)});
                          });
                          })*/
                
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("back");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : neume
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});
module.exports = router;