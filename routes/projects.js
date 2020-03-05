var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
fs = require('fs');
var reload = require('require-reload')(require);
var logger = require('../logger');
//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.json({
    limit: '50mb'
}));
router.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
router.use(methodOverride(function(req, res) {
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
global.imageData = []; //Getting all the imageData in binary from the storedimages collection
global.neumeSectionArray = []; //Array to keep the neumes in the section

//build the REST operations at the base for projects
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router.route('/')
    //GET all projects
    //Get all the neumes from the database :
    .get(function(req, res, next) {

        projectIds = req.body._id;
        mongoose.model('User').find({
            _id: req.session.userId
        }, function(err, users) {
            userFinal = users;
            // logger.info(userFinal);//This works!!!
        });
        //retrieve all projects from Mongo
        mongoose.model('project').find({
            userID: req.session.userId
        }, function(err, projects) {
            if (err) {
                return logger.error(err);
            } else {
                logger.debug(project._id);
                mongoose.model('project').find({
                    userID: {
                        $nin: [req.session.userId]
                    }
                }, function(err, projectsAll) {
                    if (err) {
                        return logger.error(err);
                    } else {

                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                        res.format({
                            //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                            html: function() {
                                logger.debug(userFinal);
                                res.render('projects/index', {
                                    title: 'Projects',
                                    "projects": projects,
                                    "users": userFinal,
                                    "allProject": projectsAll
                                });
                            },
                            //JSON response will show all projects in JSON format
                            json: function() {
                                res.json(projects);
                            }
                        });
                    }
                });
            }
            //global.userFinal = []; //The user needs to be added in all the routes

        });

    })

    //PUT to update a project by ID
    .put(function(req, res) {
        // Get our REST or form values. These rely on the "name" attributes from the edit page

        //find the document by ID
        mongoose.model('project').findById(req.id, function(err, project) {
            //update it
            project.update({
                name: name,
                folio: folio,
                description: description,
                classification: classification,
                mei: mei,
                dob: dob,
                imagePath: editArray //adding the image to the image array without reinitializng everything
            }, function(err, projectID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/projects/");
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(project);
                        }
                    });
                }
                //Deletes the file from the folder
                if (req.body.image == "deleted") {
                    const fs = require('fs');

                    fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                        if (err) throw err;
                        logger.info('successfully deleted');
                    });
                }
            })
        });
    })

    //POST a new project
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var projectUserID = req.session.userId;
        var projectArray = [];
        var admin = req.session.userId; //This is the admin id that created the project
        projectArray.push(projectUserID)
        //logger.info(projectUsername); //This is undefined.
        //call the create function for our database
        mongoose.model('project').create({
            name: name,
            userID: projectArray,
            admin: admin //This will be the userID

        }, function(err, project) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                mongoose.model('User').find({
                    _id: req.session.userId
                }, function(err, users) {
                    userFinal = users;
                    // logger.info(userFinal);//This works!!!
                });
                //project has been created
                logger.info('POST creating new project: ' + project);

                //project requests for the images inside of projects
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function() {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page redirecting to classifier project page
                        res.redirect("/projects");
                    },
                    //JSON response will show the newly created project
                    json: function() {
                        res.json(project);
                    }
                });
            }
        })
    });

/* GET New project page. */
router.get('/new', function(req, res) {
    res.render('projects/new', {
        title: 'Add New project'
    });
    //Adding the new names lines
});

/* GET New project page. */
router.get('/:id/new', function(req, res) {
    res.render('projects/newNeume', {
        title: 'Add New project'
    });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //logger.info('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('project').find({
        _id: id
    }, function(err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            logger.warn(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function() {
                    next(err);
                },
                json: function() {
                    res.json({
                        message: err.status + ' ' + err
                    });
                }
            });
            //if it is found we continue on
        } else {
            mongoose.model('User').find({
                _id: req.session.userId
            }, function(err, users) {
                userFinal = users;
                // logger.info(userFinal);//This works!!!
            });
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //logger.info(project);
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
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                logger.warn('GET Error: There was a problem retrieving: ' + err);
            } else {
                //Return the project
                logger.debug('GET Retrieving ID: ' + project._id);
                var projectdob = project.dob.toISOString();
                projectdob = projectdob.substring(0, projectdob.indexOf('T'))
                res.format({
                    //HTML response will render the 'edit.jade' template
                    html: function() {
                        res.redirect("/projects/")
                    },
                    //JSON response will return the JSON output
                    json: function() {
                        res.json(project);
                    }
                });
            }
        }).populate('image').exec((err, posts) => {
            logger.debug("Populated Image " + posts);
        });
    })
    //PUT to update a project by ID
    .put(function(req, res) {
        // Get our REST or form values. These rely on the "name" attributes from the edit page
        var name = req.body.projectName;
        logger.debug(name); //this isnt shown
        //find the document by ID
        mongoose.model('project').findById(req.id, function(err, project) {

            project.update({
                name: name
            }, function(err, projectID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/projects/");
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(project);
                        }
                    });
                }
                //Deletes the file from the folder
                if (req.body.image == "deleted") {
                    const fs = require('fs');

                    fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                        if (err) throw err;
                        logger.debug('successfully deleted');
                    });
                }
            })
        });
    })
    //DELETE a project by ID
    .delete(function(req, res) {
        //find project by ID
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                return logger.error(err);
            } else {
                //remove it from Mongo
                project.remove(function(err, project) {
                    if (err) {
                        return logger.error(err);
                    } else {
                        //Returning success messages saying it was deleted
                        logger.info('DELETE removing ID: ' + project._id);
                        mongoose.model('User').find({
                            _id: req.session.userId
                        }, function(err, users) {
                            userFinal = users;
                            // logger.info(userFinal);//This works!!!
                        });
                        res.format({
                            //HTML returns us back to the main page, or you can create a success page
                            html: function() {
                                res.redirect("/projects");
                            },
                            //JSON returns the item with the message that is has been deleted
                            json: function() {
                                res.json({
                                    message: 'deleted',
                                    item: project
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
        mongoose.model('project').find({}, function(err, projects) {
            if (err) {
                return logger.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function() {
                        res.render('projects/index', {
                            title: 'projects',
                            "projects": projects
                        });
                    },
                    //JSON response will show all projects in JSON format
                    json: function() {
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
            name: name,
            folio: folio,
            description: description,
            classification: classification,
            mei: mei,
            dob: dob,
            imagePath: imageArray


        }, function(err, project) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //project has been created
                logger.info('POST creating new project: ' + project); //project holds the new project

                //project requests for the images inside of projects
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function() {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page
                        res.redirect("/projects/" + projectID);
                    },
                    //JSON response will show the newly created project
                    json: function() {
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
    //logger.info('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('project').findById(id, function(err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            logger.warn(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function() {
                    next(err);
                },
                json: function() {
                    res.json({
                        message: err.status + ' ' + err
                    });
                }
            });
            //if it is found we continue on
        } else {

            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //logger.info(project);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/project/:id') //Doesnt lead to the projects page, see projects/:id for the projects

    .get(function(req, res) {
        mongoose.model('project').findById(req.id, function(err, project) {

            if (err) {
                logger.warn('GET Error: There was a problem retrieving: ' + err);
            } else {

                logger.debug('GET Retrieving ID: ' + project._id);
                mongoose.model('neume').find({
                    project: project._id
                }, function(err, neumes) {
                    global.ArrayNeumes = [];
                    ArrayNeumes.push(neumes);
                    logger.debug(ArrayNeumes);
                });
                var projectdob = project.dob.toISOString();
                projectdob = projectdob.substring(0, projectdob.indexOf('T'))
                res.format({
                    html: function() {
                        res.render('projects/show', {
                            "projectdob": projectdob,
                            "project": project,
                            "neumes": ArrayNeumes
                        });
                    },
                    json: function() {
                        res.json(project);
                    }
                });
            }
        });
        logger.debug(project._id);
    });


router.route('/project/:id/edit')
    //GET the individual project by Mongo ID
    .get(function(req, res) {
        //search for the project within Mongo
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                logger.warn('GET Error: There was a problem retrieving: ' + err);
            } else {
                //Return the project
                logger.info('GET Retrieving ID: ' + project._id);
                var projectdob = project.dob.toISOString();
                projectdob = projectdob.substring(0, projectdob.indexOf('T'))
                res.format({
                    //HTML response will render the 'edit.jade' template
                    html: function() {
                        res.render('projects/edit', {
                            title: 'project' + project._id,
                            "projectdob": projectdob,
                            "project": project,
                            "projectImages": project.imagePath
                        });
                    },
                    //JSON response will return the JSON output
                    json: function() {
                        res.json(project);
                    }
                });
            }
        }).populate('image').exec((err, posts) => {
            logger.debug("Populated Image " + posts);
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
        mongoose.model('project').findById(req.id, function(err, project) {
            //update it
            editArray = project.imagePath.concat(imageArray);
            project.update({
                name: name,
                folio: folio,
                description: description,
                classification: classification,
                mei: mei,
                dob: dob,
                imagePath: editArray //adding the image to the image array without reinitializng everything
            }, function(err, projectID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/projects/");
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(project);
                        }
                    });
                }
                //Deletes the file from the folder
                if (req.body.image == "deleted") {
                    const fs = require('fs');

                    fs.unlink('uploads/' + req.body.name + ".jpg", (err) => {
                        if (err) throw err;
                        logger.info('successfully deleted');
                    });
                }
            })
        });
    })
    //This method doesnt work, might need to change it later. The last method of this file is the delete method for deleting a project
    .delete(function(req, res) {
        //find project by ID
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                return logger.error(err);
            } else {
                //remove it from Mongo
                project.remove(function(err, project) {
                    if (err) {
                        return logger.error(err);
                    } else {
                        //Returning success messages saying it was deleted
                        logger.debug('DELETE removing ID: ' + project._id);
                        res.format({
                            //HTML returns us back to the main page, or you can create a success page
                            html: function() {
                                res.redirect("/projects");
                            },
                            //JSON returns the item with the message that is has been deleted
                            json: function() {
                                res.json({
                                    message: 'deleted',
                                    item: project
                                });
                            }
                        });
                    }
                });
            }
        });
    });

/* Delete dropzone images. */
router.route('/deleteImageDropzone')
    //DELETE an image by ID
    .delete(function(req, res) {
        //imageDeleted is the path of the image we want to delete.
        global.imageToDeleteDropzone = id;
        //remove from neume array the imagepath = imageDeleted
        //deleting the images from the image model
        fs.unlink('uploads/' + imageToDeleteDropzone, (err) => {
            if (err)
                throw err;
            else {
                logger.debug('successfully deleted'); //This worked.

                for (var i = 0; i < imageArray.length; i++) {
                    if (imageArray[i] === imageToDeleteDropzone) {
                        imageArray.splice(i, 1);
                    }
                }
                res.status(204).send()
            }
        });

    });
/////ROUTE FOR THE ID!!!!!
////////////////////////////
/**************************/
router.route('/:id') //This is where the classifier would be
    .get(function(req, res, next) {
        mongoose.model('project').findById(req.id, function(err, project) {


            if (err) {
                logger.info('GET Error: There was a problem retrieving: ' + err);
            } else {

                if (project == null) {
                    res.redirect("/");
                } else {
                    var positionArray = project.positionArray;
                    mongoose.model('neume').find({
                        project: project._id
                    }, function(err, neumes) {

                        neumeFinal = neumes;

                        //Updating the name
                        //Getting the neumes for each project and showing them in the logger!!
                        //Element in face
                        logger.info(neumeFinal);
                        mongoose.model('User').find({
                            _id: req.session.userId
                        }, function(err, users) {
                            userFinal = users;
                            // logger.info(userFinal);//This works!!!
                        });
                        mongoose.model("neume").find({
                            project: project._id
                        }, function(err, neumes) {
                            neumes.forEach(function(neume) { //Change this to a for loop to make the data faster. Right now the performance is almost 5 minutes.

                                if(neume.classifier == undefined){
                                    logger.info("no classifier")
                                }

                              else if(neume.classifier.includes(".xlsx")){
                                var image = neume.imageMedia;
                                //logger.info(image);
                                if (fs.existsSync('exports/xl/media/' + image)) {
                                    var imgPath = 'exports/xl/media/' + image; //This is undefined.
                                    var A = storedImages;
                                    var a = new A;
                                    a.projectID = project._id;
                                    a.neumeID = neume._id;
                                    a.img.data = fs.readFileSync(imgPath);
                                    a.img.contentType = 'image/png';
                                    a.imgBase64 = a.img.data.toString('base64');

                                    imageData.push(a.img.data.toString('base64')); //This works for all the images stored in the database.
                                    //logger.info(imageData); //This works
                                    mongoose.model('neume').find({
                                        _id: neume._id
                                    }).update({
                                            //push the neumes into the imagesBinary array
                                            imagePath: 'exports/xl/media/' + neume.imageMedia,
                                            imagesBinary: fs.readFileSync('exports/xl/media/' + neume.imageMedia).toString('base64')
                                        },

                                        function(err, data) {
                                            //logger.info(err, data);
                                            imageData = [];

                                            a.save(function(err, a) {
                                                if (err) throw err;

                                                logger.error('saved img to mongo');
                                            });
                                        });
                                }
                              }

                            })

                        });
                        mongoose.model("section").find({
                            projectID: project._id
                        }, function(err, sections) {

                            //Here, we need a logic that will produce a variable neumeSection which is all the neumes for each
                            //section, which is different for each section.



                            var sections = sections;
                            logger.info(neumeSectionArray); //This is still empty

                            logger.info('GET Retrieving ID: ' + project._id);
                            var projectdob = project.dob.toISOString();
                            projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                            res.format({
                                html: function() {

                                    res.render('projects/show', {
                                        "projectdob": projectdob,
                                        "project": project,
                                        "neumes": neumeFinal,
                                        "users": userFinal,
                                        "sections": sections,
                                        "neumeSections": neumeSectionArray,
                                        "positionArray": positionArray

                                    });
                                },
                                json: function() {
                                    res.json(project);
                                }
                            });
                        })
                    });
                }
            }
        });
    });

router.route('/public/:id') //This is where the classifier would be
    .get(function(req, res) {
        var projectName = req.body.projectName;
        logger.info(projectName);
        global.nameOfProject = projectName;

        mongoose.model('project').findById(req.id, function(err, project) {

            if (err) {
                logger.info('GET Error: There was a problem retrieving: ' + err);
            } else {
                if (project == null) {
                    res.redirect("/");
                }
                //Updating the name
                //Getting the neumes for each project and showing them in the logger!!
                //Element in face
                //logger.info(userFinal);//This works!
                else {
                    mongoose.model('neume').find({
                        project: project._id
                    }, function(err, neumes) {
                        neumeFinal = neumes;
                        //logger.info(neumeFinal);//This works!!!

                        // logger.info(neumeFinal);
                        logger.info('GET Retrieving ID: ' + project._id);
                        var projectdob = project.dob.toISOString();
                        projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                        res.format({
                            html: function() {
                                logger.info(neumeFinal); //This is shown on the logger!
                                logger.info(userFinal) //This is shown on the logger!

                                res.render('neumes/show', {
                                    "projectdob": projectdob,
                                    "project": project,
                                    "neumes": neumeFinal
                                });
                            },
                            json: function() {
                                res.json(project);
                            }
                        });
                    });
                }
            }
        });
    });

router.route('/forkPublic/:id') //This is where the classifier would be
    .get(function(req, res) {
        var projectName = req.body.projectName;
        logger.info(projectName);
        global.nameOfProject = projectName;
        var userFinal = [];
        mongoose.model('project').findById(req.id, function(err, project) {

            if (err) {
                logger.info('GET Error: There was a problem retrieving: ' + err);
            } else {
                //Updating the name
                //Getting the neumes for each project and showing them in the logger!!
                //Element in face
                //logger.info(userFinal);//This works!
                mongoose.model('neume').find({
                    project: project._id
                }, function(err, neumes) {
                    neumeFinal = neumes;
                    //logger.info(neumeFinal);//This works!!!
                    mongoose.model('User').find({
                        _id: req.session.userId
                    }, function(err, users) {
                        userFinal = users;
                        // logger.info(userFinal);//This works!!!

                        // logger.info(neumeFinal);
                        logger.info('GET Retrieving ID: ' + project._id);
                        var projectdob = project.dob.toISOString();
                        projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                        res.format({
                            html: function() {
                                logger.info(neumeFinal); //This is shown on the logger!
                                logger.info(userFinal) //This is shown on the logger!

                                res.render('projects/showFork', {
                                    "projectdob": projectdob,
                                    "project": project,
                                    "neumes": neumeFinal,
                                    "users": userFinal
                                });
                            },
                            json: function() {
                                res.json(project);
                            }
                        });
                    });
                });
            }
        });
    });

router.route('/:id/edit')
    //GET the individual project by Mongo ID
    .get(function(req, res) {
        //search for the project within Mongo
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                logger.info('GET Error: There was a problem retrieving: ' + err);
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    html: function() {
                        res.redirect("/projects/" + req.id);
                    },
                    //JSON responds showing the updated values
                    json: function() {
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
        logger.info(projectName);

        //find the document by ID
        mongoose.model('project').findById(req.id, function(err, project) {
            //update it
            project.update({ //This works, it's just the element from the page that isn't sent over.
                name: projectName

            }, function(err, projectID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/projects/" + project._id);
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(project);
                        }
                    });
                }
            })
        });
    })
    //~~~> Function used to DELETE a project by ID (This is the only one that has action on the project)
    .delete(function(req, res) {
        //find project by ID
        mongoose.model('project').findById(req.id, function(err, project) {
            var projectid = project._id;
            if (err) {
                return logger.error(err);
            } else {
                //remove it from Mongo
                project.remove(function(err, project) {
                    if (err) {
                        return logger.error(err);
                    } else {

                        mongoose.model('User').findById(req.session.userId, function(err, user) {

                            if (err) {
                                return logger.error(err);
                            } else {
                                //This works, when the page is reloaded
                                mongoose.model('User').findOneAndUpdate({
                                        _id: user._id
                                    }, {
                                        $pull: {
                                            collaborators: {
                                                projectID: projectid
                                            } //inserted data is the object to be inserted
                                        }
                                    },

                                    function(err, data) {
                                        logger.info(err, data);
                                    });
                                //That's it.
                                mongoose.model('neume').remove({
                                    project: project._id
                                }).exec();
                                mongoose.model("storedImages").remove({
                                    projectID: project._id
                                }, function(err, image) {
                                    logger.info(image);
                                    if (err) {
                                        return logger.error(err);
                                    } else {
                                        logger.info("worked");
                                    }
                                });
                                //Returning success messages saying it was deleted
                                logger.info('DELETE removing ID: ' + project._id);
                                res.format({
                                    //HTML returns us back to the main page, or you can create a success page
                                    html: function() {
                                        res.redirect("/projects");
                                    },
                                    //JSON returns the item with the message that is has been deleted
                                    json: function() {
                                        res.json({
                                            message: 'deleted',
                                            item: project
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
module.exports = router;
