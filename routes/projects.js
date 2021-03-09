var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
fs = require('fs');
var reload = require('require-reload')(require);
var logger = require('../logger');
var renderError = require('../public/javascripts/error');
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
    .get(function(req, res, next) {

        projectIds = req.body._id;
        // if not logged in
        if (req.session.userId === null) {
            userFinal = null;
            logged_in = false;
        } else {
            mongoose.model('User').find({
                _id: req.session.userId
            }, function(err, users) {
                userFinal = users;
            });
        }
        //retrieve all projects from Mongo
        mongoose.model('project').find({
            userID: req.session.userId
        }, function(err, projects) {
            if (err) {
                return renderError(res, err);
            } else {
                logger.debug(project._id);
                mongoose.model('project').find({
                    userID: {
                        $nin: [req.session.userId]
                    }
                }, function(err, projectsAll) {
                    if (err) {
                        return renderError(res, err);
                    } else {

                        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                        res.format({
                            //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                            html: function() {
                                logger.debug(userFinal);
                                res.render('projects/projectindex', {
                                    title: 'Projects',
                                    "projects": projects.reverse(), // the projects come in reverse chronological order of creation, so reverse
                                    "user": userFinal,
                                    "other": projectsAll.reverse()
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
                    return renderError(res, err);
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
                        if (err) { return renderError(res, err); }
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
                return renderError(res, err);
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

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //logger.info('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('project').find({
        _id: id
    }, function(err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            return renderError(res, err);
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

// route for the project when the user owns it
router.route('/:id')
    .get(function(req, res, next) {
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                return renderError(res, err);
            } else {
                if (project == null) {
                    return renderError(res, 'project with id: ' + req.id + ' is null');
                } else {
                    var positionArray = project.positionArray;
                    mongoose.model('neume').find({
                        project: project._id
                    }, function(err, neumes) {
                        if (err) { return renderError(res, err); }
                        neumeFinal = neumes;

                        //Updating the name
                        //Getting the neumes for each project and showing them in the logger!!
                        //Element in face
                        // logger.info(neumeFinal);
                        mongoose.model('User').find({
                            _id: req.session.userId
                        }, function(err, users) {
                            if (err) { return renderError(res, err); }
                            userFinal = users;
                            // logger.info(userFinal);//This works!!!
                        });
                        mongoose.model("neume").find({
                            project: project._id
                        }, function(err, neumes) {
                            if (err) { return renderError(res, err); }
                            for (let neume of neumes) {
                                if (neume.classifier == undefined) {
                                    logger.info('no classifier for neume with id ' + neume._id);
                                } else if (neume.classifier.includes(".xlsx")) {
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

                                        imageData.push(a.img.data.toString('base64'));
                                        var err_pass; // to receive error and render after the internal function
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
                                                    if (err) { err_pass = err; return; }

                                                    logger.info('saved img to mongo');
                                                });
                                            });
                                        if (err_pass) { return RenderError(res, err_pass); }
                                    }
                                }
                            }
                            if (err) { return renderError(res, err); }
                            mongoose.model("section").find({
                                projectID: project._id
                            }, function(err, sections) {
                                if (err) { return renderError(res, err); }
                                var sections = sections;
                                logger.info(neumeSectionArray); //This is still empty

                                logger.info('GET Retrieving ID: ' + project._id);
                                var projectdob = project.dob.toISOString();
                                projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                                res.format({
                                    html: function() {

                                        res.render('projects/showproject', {
                                            "projectdob": projectdob,
                                            "project": project,
                                            "neumes": neumeFinal,
                                            "user": userFinal[0],
                                            "sections": sections,
                                            "neumeSections": neumeSectionArray,
                                            "positionArray": positionArray,
                                            "owned": true
                                        });
                                    },
                                    json: function() {
                                        res.json(project);
                                    }
                                });
                            })
                        });
                    });
                }
            }
        });
    });

// route for a project logged out
router.route('/public/:id')
    .get(function(req, res) {
        var projectName = req.body.projectName;
        logger.info(projectName);
        global.nameOfProject = projectName;

        mongoose.model('project').findById(req.id, function(err, project) {

            if (err) {
                return renderError(res, err);
            } else {
                if (project == null) {
                    return renderError(res, 'project is null');
                }
                //Updating the name
                //Getting the neumes for each project and showing them in the logger!!
                //Element in face
                //logger.info(userFinal);//This works!
                else {
                    mongoose.model('neume').find({
                        project: project._id
                    }, function(err, neumes) {
                        if (err) { return renderError(res, err); }
                        neumeFinal = neumes;
                        //logger.info(neumeFinal);//This works!!!

                        // logger.info(neumeFinal);
                        logger.info('GET Retrieving ID: ' + project._id);
                        var projectdob = project.dob.toISOString();
                        projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                        res.format({
                            html: function() {
                                // logger.info(neumeFinal); //This is shown on the logger!
                                logger.info(userFinal) //This is shown on the logger!

                                res.render('projects/showproject.jade', {
                                    "projectdob": projectdob,
                                    "project": project,
                                    "neumes": neumeFinal,
                                    "user": null,
                                    "owned": false
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

// route for a project when the user is logged in but doesn't own it
router.route('/fork/:id')
    .get(function(req, res) {
        var projectName = req.body.projectName;
        logger.info(projectName);
        global.nameOfProject = projectName;
        var userFinal = [];
        mongoose.model('project').findById(req.id, function(err, project) {

            if (err) {
                return renderError(res, err);
            } else {
                //Updating the name
                //Getting the neumes for each project and showing them in the logger!!
                //Element in face
                //logger.info(userFinal);//This works!
                mongoose.model('neume').find({
                    project: project._id
                }, function(err, neumes) {
                    if (err) { return renderError(res, err); }
                    neumeFinal = neumes;
                    //logger.info(neumeFinal);//This works!!!
                    mongoose.model('User').find({
                        _id: req.session.userId
                    }, function(err, users) {
                        if (err) { return renderError(res, err); }
                        if (users.length > 1) {
                            return renderError(res, "Multiple users found for the same user ID");
                        }
                        userFinal = users[0];
                        // logger.info(userFinal);//This works!!!

                        // logger.info(neumeFinal);
                        logger.info('GET Retrieving ID: ' + project._id);
                        var projectdob = project.dob.toISOString();
                        projectdob = projectdob.substring(0, projectdob.indexOf('T'))

                        res.format({
                            html: function() {
                                logger.info(neumeFinal); //This is shown on the logger!
                                logger.info(userFinal) //This is shown on the logger!

                                res.render('projects/showproject.jade', {
                                    "projectdob": projectdob,
                                    "project": project,
                                    "neumes": neumeFinal,
                                    "user": userFinal,
                                    "owned": false
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

// route to edit a project
router.route('/:id/edit')
    //GET the individual project by Mongo ID
    .get(function(req, res) {
        //search for the project within Mongo
        mongoose.model('project').findById(req.id, function(err, project) {
            if (err) {
                return renderError(res, err);
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
                    return renderError(res, err);
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
                return renderError(res, err);
            } else {
                //remove it from Mongo
                project.remove(function(err, project) {
                    if (err) {
                        return renderError(res, err);
                    } else {

                        mongoose.model('User').findById(req.session.userId, function(err, user) {

                            if (err) {
                                return renderError(res, err);
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
                                        return renderError(res, err);
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

// Update the sections to add neumes inside.
router.route('/updateSection')
    .post(function(req, res) {
        var neumeSectionIds = Array.from(req.body.neumeSectionIds);
        var sectionID = req.body.SectionID;

        mongoose.model('section').findOneAndUpdate({
                _id: sectionID
            }, {
                //push the neumes into the imagesBinary array
                $push: {
                    neumeIDs: neumeSectionIds
                }
            },

            function(err, data) {
                if (err) {
                    return renderError(res, err);
                } else {
                    logger.info(data);
                    //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                    res.format({
                        //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                        html: function() {
                            logger.info(userFinal);
                            res.redirect("back");
                        },
                        //JSON response will show all projects in JSON format
                        json: function() {
                            res.json(projects);
                        }
                    });
                }
            })
    });

// save a neumes position (in a section or not)
router.route('/savePosition')
    .post(function(req, res) {

        // Get our REST or form values. These rely on the "name" attributes from the edit page
        var position = req.body.position;
        var projectID = req.body.projectIDPosition;

        //find the document by ID
        mongoose.model('project').findById(projectID, function(err, project) {
            //update it
            project.update({
                positionArray: position //adding the image to the image array without reinitializng everything
            }, function(err, project) {
                if (err) {
                    return renderError(res, err);
                } else {
                    logger.info(project.positionArray);
                }
            })
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                html: function() {
                    res.redirect("back");
                },
                //JSON responds showing the updated values
                json: function() {
                    res.json(project);
                }
            });
        })

    });

// route to make a section
router.route('/section')
    .post(function(req, res) {

        //We want to get the sections collection and add a new section with the 2 neumes inside.

        // Get our REST or form values. These rely on the "name" attributes from the edit page
        var name = req.body.nameSection;
        var projectID = req.body.ID_project;

        //find the document by ID
        //call the create function for our database
        mongoose.model('section').create({
            name: name,
            projectID: projectID

        }, function(err, section) {
            if (err) {
                return renderError(res, err);
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    html: function() {
                        res.redirect("back");
                    },
                    //JSON responds showing the updated values
                    json: function() {
                        res.json(neume);
                    }
                });
            }
        });
    });

// route to delete a section
router.route('/sectionDelete')
    .delete(function(req, res) {
        var sectionID = req.body.sectionId;
        //find neume by ID
        mongoose.model('section').findById(sectionID, function(err, section) {
            if (err) {
                return renderError(res, err);
            } else {
                section.remove(function(err, section) {
                    if (err) {
                        return renderError(res, err);
                    } else {
                        //Returning success messages saying it was deleted
                        res.format({
                            //HTML returns us back to the main page, or you can create a success page
                            html: function() {
                                res.redirect("back");
                            },
                            //JSON returns the item with the message that is has been deleted
                            json: function() {
                                res.json({
                                    message: 'deleted',
                                    item: neume
                                });
                            }
                        });
                    }
                });
            }
        });
    });

module.exports = router;
