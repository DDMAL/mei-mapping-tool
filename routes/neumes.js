var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'); // used to manipulate POST
var storedImages = require('../model/storedImages');
var fs = require('fs');
var logger = require('../logger');
global.neumes_array = [];
var renderError = require('../public/javascripts/error');

const sharp = require('sharp');

router.use(bodyParser.json({
    limit: '50mb'
}));
router.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

// add javascript to create array and make that part of put request
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

//  Route for the cancel button on editNeume and newNeume
router.route('/cancel')
    //  GET all neumes
    .get(function(req, res, next) {
        imageArray = [];

        mongoose.model('project').find({}, function(err, projects) {
            if (err) {
                return renderError(res, err);
            } else {
                //  respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //  HTML response will render the index.jade file in the views/neumes folder. We are also setting "neumes" to be an accessible variable in our jade view
                    html: function() {
                        res.redirect('back')
                    },
                    //  JSON response will show all neumes in JSON format
                    json: function() {
                        res.json(projects)
                    }
                })
            }
        })
    })

// build the REST operations at the base for neumes
// post function to create a new neume
// router.route('/')
//     //  POST a new neume
//     .post(function(req, res) {
//         // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
//         var name = req.body.name;
//         var folio = req.body.folio;
//         var description = req.body.description;
//         var neumeSection = req.body.neumeSection;
//         var neumeSectionName = req.body.neumeSectionName;
//         var source = req.body.source;
//         var genericName = req.body.genericName;
//
//         var classification = req.body.classification
//         var mei = req.body.mei;
//         var dob = req.body.dob;
//         var ID_project = req.body.ID_project;
//         var review = req.body.review;
//
//         //call the create function for our database
//         mongoose.model('neume').create({
//             name: name,
//             folio: folio,
//             description: description,
//             classification: classification,
//             mei: mei,
//             review: review,
//             dob: dob,
//             imagePath: imageArray,
//             project: ID_project,
//             neumeSection: neumeSection,
//             neumeSectionName: neumeSectionName,
//             source: source,
//             genericName: genericName
//
//         }, function(err, neume) {
//             if (err) {
//                 return renderError(res, err);
//             } else {
//                 //neume has been created
//                 //logger.log('POST creating new neume: ' + neume); //neume holds the new neume
//                 //Show neume array
//                 //Neume requests for the images inside of neumes
//                 mongoose.model('neume').find({
//                     project: ID_project
//                 }, function(err, neumes) {
//                     neumeFinal = neumes;
//                     //logger.log(neumeFinal);//This works!!!
//                 });
//                 //Creating an xml file to store mei for each neume => neume.mei and neume._id for the name of the file
//                 //Making the xml files folder if it doesnt exist
//                 //Creating and writing the file with the information
//                 //Not really important, simply so that the user can have a history of the xml files they have written.
//
//                 // example schema for saving images in the database
//
//
//                 //Saving the images in the database from the uploads folder. (for each images in the imageArray)
//                 imageArray.forEach(function(image) {
//                     var imgPath = 'uploads/' + image;
//
//                     // our imageStored model
//                     var A = storedImages;
//                     // store an img in binary in mongo
//                     var a = new A;
//                     a.neumeID = neume._id;
//                     a.projectID = neume.project;
//                     a.img.data = fs.readFileSync(imgPath);
//                     a.img.contentType = 'image/png';
//                     a.imgBase64 = a.img.data.toString('base64');
//                     imageData.push(a.img.data.toString('base64')); //This works for all the images stored in the database.
//
//                     let resizedImageData = '';
//                     let resizedBase64 = ''
//                     var mimType = 'image/jpeg';
//                     var img = new Buffer(a.img.data.toString('base64'), 'base64');
//                     sharp(img)
//                       .resize(128,128, {
//                         fit: 'cover'
//                       })
//                       .toBuffer()
//                       .then(resImgBuf => {
//                         let resizedImageData = resImgBuf.toString('base64');
//                         let resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
//
//                         //All the images (images) need to be pushed to an array field in mongodb
//                         mongoose.model('neume').findOneAndUpdate({
//                                 _id: neume._id
//                             }, {
//                                 //push the neumes into the imagesBinary array
//                                 imagesBinary: [resizedBase64.split(',')[1]]
//                             },
//
//                             function(err, data) {
//                                 if (err) { return renderError(res, err); }
//                                 //logger.log(err, data);
//                                 imageData = [];
//                             });
//
//
//                         a.save(function(err, a) {
//                             if (err) { return renderError(res, err); };
//
//                             logger.info('saved img to mongo');
//                         });
//                       })
//                       .catch(err => {
//                         console.log(err);
//                       })
//                     // console.log('imgbase64', a.imgBase64);
//                     // console.log('img_data', a.img.data);
//
//
//
//                 });
//
//
//                 //Using GridFS, we can create a file, find that file in the uploads folder.
//                 //Then create a GridFSInputFile set that filename as the new name
//                 //Then save the file.
//
//                 res.format({
//                     html: function() {
//                         // If it worked, set the header so the address bar doesn't still say /adduser
//                         res.location("/projects/" + ID_project);
//                         // And forward to success page
//                         res.redirect("/projects/" + ID_project);
//                     },
//                     //JSON response will show the newly created neume
//                     json: function() {
//                         res.json(neume);
//                     }
//                 });
//                 imageArray = [];
//             }
//         })
//     });

/* Update edit images. */
// put function to add a new image to a neume
// ie the submit button on the editNeume modal
router.route('/:id/editImage')
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
        var genericName = req.body.genericName;
        global.editArray = [];


        var imagesToDelete = req.body.imageDeleted;

        //find the document by ID
        mongoose.model('neume').findById(req.id, function(err, neume) {
            if (err) { return renderError(res, err); }
            var ID_project = neume.project;
            //update it
            editArray = neume.imagePath.concat(imageArray); //This element is added only when the page is reloaded
            neume.update({
                imagePath: editArray //adding the image to the image array without reinitializng everything
            }, function(err, neumeElement) {
                if (err) {
                    return renderError(res, err);
                } else {

                    imageArray.forEach(function(image) {
                        var imgPath = 'uploads/' + image;

                        // our imageStored model
                        var A = storedImages;
                        // store an img in binary in mongo
                        var a = new A;
                        a.neumeID = neume._id;
                        a.projectID = neume.project;
                        a.img.data = fs.readFileSync(imgPath);
                        a.img.contentType = 'image/png';
                        a.imgBase64 = a.img.data.toString('base64');
                        imageData.push(a.img.data.toString('base64')); //This works for all the images stored in the database.

                        //All the images (images) need to be pushed to an array field in mongodb
                        mongoose.model('neume').findOneAndUpdate({
                                _id: neume._id
                            }, {
                                //push the neumes into the imagesBinary array
                                $push: {
                                    imagesBinary: imageData
                                }
                            },

                            function(err, data) {
                                if (err) { return renderError(res, err); }
                                //logger.log(err, data);
                                imageData = [];
                            });
                        a.save(function(err, a) {
                            if (err) { return renderError(res, err); };

                            logger.info('saved img to mongo');
                        });

                    });
                    mongoose.model('neume').find({
                        project: ID_project
                    }, function(err, neumes) {
                        if (err) { return renderError(res, err); }
                        neumeFinal = neumes;
                        //logger.log(neumeFinal);//This works!!!
                    });
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    imageArray = [];
                }
            })
        });

        if (imagesToDelete != 'none') {
            imagesToDelete = imagesToDelete.split(',');
            // in mongoose in order to delete or pull multiple entries
            // you have to pass the array using the $in formatting
            // so then below each imageBinary which is in the array is removed
            mongoose.model('neume').findOneAndUpdate({
                _id: req.id
            }, {
                $pull: {
                    imagesBinary: { $in: imagesToDelete }
                }
            }, function(err, data) {
                logger.log(err, data);
                mongoose.model('storedImages').deleteMany({
                    imgBase64: { $in: imagesToDelete }
                }, function(err, data) {
                    if (err) { return renderError(res, err); }
                });
            });
        }

        res.format({
            html: function() {
                res.redirect("back");
            },
            //JSON responds showing the updated values
            json: function() {
                res.json(neume);
            }
        });
    })

// route middleware to validate neume :id
router.param('id', function(req, res, next, id) {
    //logger.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('neume').findById(id, function(err, neume) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            return renderError(res, err);
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //logger.log(neume);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});
//The new projectID should be here.

// put route to edit the neume information
router.route('/:id/edit')
    //PUT to update a neume by ID
    .put(function(req, res) {

        var updateObject;
        var name = req.body.name;
        var folio = req.body.folio;
        var description = req.body.description;
        var genericName = req.body.genericName;
        var classification = req.body.classification;
        var review = req.body.review;
        var mei = req.body.mei;
        var dob = req.body.dob;
        var projectName = req.body.projectName;
        updateObject = {
            name: name,
            folio: folio,
            description: description,
            genericName: genericName, //adding the image to the image array without reinitializng everything
            classification: classification,
            mei: mei,
            review: review,
            dob: dob,
        };

        global.editArray = [];

        //find the document by ID
        mongoose.model('neume').findById(req.id, function(err, neume) {
            if (err) { return renderError(res, err); }
            var ID_project = neume.project;
            //update it
            logger.log('info', 'neume updated');
            editArray = neume.imagePath.concat(imageArray); //This element is added only when the page is reloaded
            neume.update(updateObject, function(err, neumeID) {
                if (err) {
                    return renderError(res, err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/projects/" + ID_project);
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(neume);
                        }
                    });
                    //Deletes the file from the folder
                }
            });
        })
    })

    //DELETE a neume by ID
    .delete(function(req, res) {
        //find neume by ID
        logger.log('info', 'yes ok');
        mongoose.model('neume').findById(req.id, function(err, neume) {
            var ID_project = neume.project;
            if (err) {
                return renderError(res, err);
            } else {
                //remove it from Mongo
                neume.remove(function(err, neume) {
                    if (err) {
                        return renderError(res, err);
                    } else {
                        //  Finish this when the neumes are deleted
                        mongoose.model("storedImages").remove({
                            neumeID: neume._id
                        }, function(err, image) {
                            logger.log('info', image);
                            if (err) {
                                return renderError(res, err);
                            } else {
                                logger.log('info', "worked");
                            }
                        });
                        //Returning success messages saying it was deleted
                        //logger.log('DELETE removing ID: ' + neume._id);
                        mongoose.model('neume').find({
                            project: ID_project
                        }, function(err, neumes) {
                            if (err) { return renderError(res, err); }
                            neumeFinal = neumes;
                        });

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
module.exports = router
