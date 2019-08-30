var express = require('express')
var router = express.Router()
var User = require('../model/User')
var bodyParser = require('body-parser')
var alert = require('alert-node')
const moment = require('moment')
const pathName = require('path')
const json2csv = require('json2csv').parse
const fields = ['imagePath', 'imagesBinary', 'name', 'folio', 'description', 'classification', 'mei', 'review', 'dob', 'project', 'neumeSection', 'neumeSectionName'];
global.userArray = []
global.userArray = []
var dialog = require('dialog')
var mongoose = require('mongoose')
var async = require('async')
var crypto = require('crypto')
var flash = require('express-flash')
var storedImages = require('../model/storedImages')
var SENDGRID_API_KEY = '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'

router.use(flash())
router.use(bodyParser.json({
    limit: '50mb'
}))
router.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}))
// GET route for reading data
router.get('/', function(req, res, next) {
    return res.render('index')
})
var userFinal = []

/*Forget Password Page*/

router.get('/forgot', function(req, res) {
    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                alert(error, 'yad');
                return res.redirect('back');
            } else {
                if (user === null) {
                    var err = new Error('Not Authorized.');
                    return res.format({
                        html: function() {
                            res.render('errorLog', {
                                "error": err,
                            });
                        },
                        json: function() {
                            res.json(err);
                        }
                    });
                } else {

                    return res.format({
                        html: function() {
                            res.render('forgot', {
                                "username": user.username,
                                "email": user.email
                            });
                        },
                        json: function() {
                            res.json(project);
                        }
                    });

                }
            }
        });
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
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    var err = new Error('No account with that email address exists.');
                    return res.format({
                        html: function() {
                            res.render('errorLog', {
                                "error": err,
                            });
                        },
                        json: function() {
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
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n',
                html: '<strong>You are receiving this because you (or someone else) have requested the reset of the password for your account.  Please click on the following link, or paste this into your browser to complete the process: http://' + req.headers.host + '/reset/' + token + '  . If you did not request this, please ignore this email and your password will remain unchanged. </strong> ',
            };
            sgMail.send(msg);
            var err = 'Success!! The email has been sent!';
            return res.format({
                html: function() {
                    res.render('errorLog', {
                        "error": err,
                    });
                },
                json: function() {
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
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            var err = new Error('Password reset token is invalid or has expired.');
            return res.format({
                html: function() {
                    res.render('errorLog', {
                        "error": err,
                    });
                },
                json: function() {
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
            User.findOne({
                resetPasswordToken: req.params.token
            }, function(err, user) {
                if (!user) {
                    var err = new Error('Password reset token is invalid or has expired.');
                    return res.format({
                        html: function() {
                            res.render('errorLog', {
                                "error": err,
                            });
                        },
                        json: function() {
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
        }
    ]);
});
/* GET about page. */
router.route('/about')
    .get(function(req, res) {
        mongoose.model('User').find({
            _id: req.session.userId
        }, function(err, users) {
            userFinal = users;
        });
        mongoose.model('User').find({
            _id: req.session.userId
        }, function(err, users) {
            userFinal = users;
            // console.log(userFinal);//This works!!!
        });
        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
            //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
            html: function() {
                console.log(userFinal);
                res.render('about.jade', {
                    title: 'About',
                    "users": userFinal
                });
            },
            //JSON response will show all projects in JSON format
            json: function() {
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
                    console.log(err);
                } else {
                    console.log(data);


                    //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                    res.format({
                        //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                        html: function() {
                            console.log(userFinal);
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

//global.userFinal = []; //The user needs to be added in all the routes


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
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    console.log(project.positionArray);
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
                res.send("There was a problem adding the information to the database.");
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

router.route('/sectionDelete')
    .post(function(req, res) {
        var sectionID = req.body.sectionId;
        //find neume by ID
        mongoose.model('section').findById(sectionID, function(err, section) {
            if (err) {
                return console.error(err);
            } else {
                //remove it from Mongo
                section.remove(function(err, section) {
                    if (err) {
                        return console.error(err);
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

router.route('/csv')
    .post(function(req, res) {

        var IdOfNeume = req.body.IdOfNeume;
        console.log(IdOfNeume); //This is somehow undefined.

        mongoose.model('neume').findById(IdOfNeume, function(err, neumeCSV) {
            if (err) {
                return res.status(500).json({
                    err
                });
            } else {
                //var neume = neume;
                console.log(neumeCSV);

                neumeCSV.imagesBinary = neumeCSV.imagesBinary.split(",");
                console.log(neumeCSV.imagesBinary)

                let csv

                try {
                    csv = json2csv(data, {
                        fields
                    });
                } catch (err) {
                    return res.status(500).json({
                        err
                    });
                }
                const dateTime = moment().format('YYYYMMDDhhmmss');
                const filePath = pathName.join(__dirname, "..", "exports", "csv-" + neumeCSV.name + ".csv")
                var fs = require('fs');
                var dir = './exports';

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                fs.writeFile(filePath, csv, function(err) { //This gives an error
                    if (err) {
                        return res.json(err).status(500);
                    } else {
                        return res.download(filePath);
                    }
                });

            }
        })

    });

var multer = require('multer')
var uploadCSV = multer({
    dest: 'exports/'
})
router.route('/uploadCSV')
    .post(uploadCSV.single('csvFile'), function(req, res) {

        var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
        var nameOfProject = req.body.projectName;
        var csvParser = require('csv-parse');
        var file = req.file.buffer;

        const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
        var fs = require('fs');
        var dir = './exports';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFile(filePath, file, function(err) {

        });

        const csv = require('csvtojson');

        csv()
            .fromFile(req.file.path)
            .then((jsonObj) => {

                var imagesBinary = jsonObj.imagesBinary.replace(/[\[\]']+/g, '');
                jsonObj.imagesBinary = imagesBinary;

                mongoose.model("neume").insert(jsonObj)
                    .then(function(jsonObj) {

                        jsonObj.forEach(function(neume) {
                            mongoose.model("neume").find({
                                _id: neume.id
                            }).update({
                                project: IdOfProject
                            }, function(err, neumeElement) {
                                if (err) {
                                    res.send("There was a problem updating the information to the database: " + err);
                                } else {
                                    mongoose.model('neume').find({
                                        _id: neume.id
                                    }).update({
                                        imagesBinary: neumeElement.imagesBinary.replace(/[\[\]']+/g, ''),
                                        mei: neumeElement.mei.replace("“$1”", /"([^"]*)"/g)
                                    }, function(err, neumeElement) {
                                        if (err) {
                                            res.send("There was a problem updating the information to the database: " + err);
                                        } else {
                                            console.log("hey");
                                        }
                                    })
                                }
                            })

                        })




                        res.redirect("back");
                    })
                    .catch(function(err) {
                        err = "Please, only upload the csv file downloaded from the project."
                        return res.format({
                            html: function() {
                                res.render('errorLog', {
                                    "error": err,
                                });
                            },
                            json: function() {
                                res.json(err);
                            }
                        });
                    });
            });
    })

var fs = require('fs');
var dir = './exports';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
var multer = require('multer')
var uploadCSV = multer({
    storage: multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, './exports');
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
        }
    })
}).single('fileImage');
router.route('/imageCSV')
    .post(uploadCSV, function(req, res) {

        var fileType = req.body.fileType;
        console.log(fileType); //This is docx
        var originalFileName = req.file.originalname;

        if (fileType == ".xlsx") {

            //Add error message if the names or the column order are not right
            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
            var nameOfProject = req.body.projectName;

            //1. I need to upload the excel file here
            console.log(originalFileName);
            node_xj = require("xls-to-json");
            node_xj({
                input: req.file.path, // input xls
                output: "output.json", // output json // specific sheetname
                rowsToSkip: 0 // number of rows to skip at the top of the sheet; defaults to 0
            }, function(err, result) {
                if (err) {
                    var err = 'Error : You need to have the right number of columns and the right names for the upload to proceed.';

                } else {
                    var unzip = require('unzipper');
                    var fs = require("fs");
                    try {
                        fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                            path: './exports'
                        }));
                    } catch (e) {
                        console.log('Caught exception: ', e);
                    }
                    var XLSX = require('xlsx'); //xlsx skips rows if they are blank. The first picture not being in the right order is because the 
                    //excel book has an extra first image that is a green background. If the green background picture is taken away, the excel upload will be in the right order.
                    var workbook = XLSX.readFile(req.file.path);
                    var sheet_name_list = workbook.SheetNames;
                    result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                    console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]))


                    let workbook_firstRow = XLSX.readFile(req.file.path, {
                        sheetRows: 1
                    })
                    let sheetsList = workbook_firstRow.SheetNames
                    let sheetData = XLSX.utils.sheet_to_json(workbook_firstRow.Sheets[sheetsList[0]], {});

                    mongoose.model("neume").insertMany(result)
                        .then(function(jsonObj) {

                            jsonObj.forEach(function(neume) {
                                mongoose.model("neume").find({
                                    _id: neume.id
                                }).update({
                                    project: IdOfProject,
                                    classifier: originalFileName,
                                    mei: neume.mei
                                    //I also need to add the classifier name as a field
                                }, function(err, neumeElement) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        console.log(neumeElement);
                                        var fs = require('fs');

                                        //2. I need to unzip the file and add the unzipped content to a directory
                                        if (fileType == ".xlsx") {

                                            var dir = './exports';

                                            if (!fs.existsSync(dir)) {
                                                fs.mkdirSync(dir);
                                            }
                                            var unzip = require('unzipper');
                                            try {
                                                fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                                                    path: './exports'
                                                }));
                                            } catch (e) {
                                                console.log('Caught exception: ', e);
                                            }
                                            var fs = require('fs');
                                            if (fs.existsSync('./exports/xl/drawings/drawing1.xml') && fs.existsSync("./exports/xl/drawings/_rels/drawing1.xml.rels")) {
                                                fs.readFile("./exports/xl/drawings/drawing1.xml", function(err, data) {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    let xmlParser = require('xml2json');
                                                    let xmlString = data.toString();
                                                    //console.log('JSON output', xmlParser.toJson(xmlString));
                                                    var jsonObj = xmlParser.toJson(xmlString);
                                                    var jsonArray = [];
                                                    jsonArray = jsonObj.split(',');
                                                    //console.log(jsonArray);
                                                    var rowArray = [];
                                                    var imageArray = [];
                                                    var a = 0;
                                                    for (var i = 0; i < jsonArray.length; i++) {
                                                        //console.log(jsonArray[i] + "hey") 
                                                        if (jsonArray[i].includes("\"xdr:row\":")) { //console.log(jsonArray[i].split(":")[2]);
                                                            var rowValue = jsonArray[i].split(":")[2]; //this is the xdr:row that we have from the element

                                                        }
                                                        if (jsonArray[i].includes("\"r:embed\":")) {
                                                            //console.log(jsonArray[i].split(":")[2]);
                                                            var rowWithId = jsonArray[i].split(":")[2];
                                                            rowWithId = rowWithId.replace("\}", "");
                                                            rowArray.push(rowWithId);
                                                            //console.log(rowArray); //This works perfectly
                                                            //An error happens when the neume gets all the files
                                                            fs.readFile("./exports/xl/drawings/_rels/drawing1.xml.rels", function(err, data) {
                                                                if (err) {
                                                                    var err = 'Error : You cannot upload an old version of excel. Please make sure that your version of excel is updated.';

                                                                } else {
                                                                    let xmlParser = require('xml2json');
                                                                    let xmlString = data.toString();
                                                                    //console.log('JSON output', xmlParser.toJson(xmlString));
                                                                    var jsonObj = xmlParser.toJson(xmlString);
                                                                    var jsonArray = [];
                                                                    var rowValue = "";
                                                                    jsonArray = jsonObj.split(',');
                                                                    //console.log(jsonArray);
                                                                    imageArray = [];

                                                                    for (var i = 0; i < jsonArray.length; i++) {
                                                                        //console.log(jsonArray[i] + "hey") 
                                                                        if (jsonArray[i].includes("Id")) { //console.log(jsonArray[i].split(":")[2] );
                                                                            rowValue = jsonArray[i].split(":")[2];
                                                                            if (jsonArray[i].split(":")[2] == null || jsonArray[i].split(":")[2] == "") {
                                                                                rowValue = jsonArray[i].split(":")[1];
                                                                            }

                                                                            //this is the xdr:row that we have from the element

                                                                        }
                                                                        if (jsonArray[i].includes("media")) {
                                                                            //console.log(jsonArray[i].split(":")[1]);
                                                                            var rowWithId = jsonArray[i].split(":")[1].split("/")[2];
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\]", "");
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\"", "");

                                                                            var element = rowValue.concat(" : " + rowWithId);
                                                                            imageArray.push(element);
                                                                            console.log(imageArray); //This works perfectly
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        };

                                                    }

                                                    if (fs.existsSync('./exports/xl/drawings/drawing1.xml') && fs.existsSync("./exports/xl/drawings/_rels/drawing1.xml.rels")) {
                                                        mongoose.model("neume").find({
                                                            $and: [{
                                                                classifier: originalFileName
                                                            }, {
                                                                project: IdOfProject
                                                            }]
                                                        }, function(err, neumes) {
                                                            var indice = 0;
                                                            neumes.forEach(function(neume) { //Change this to a for loop to make the data faster. Right now the performance is almost 5 minutes.
                                                                //update it
                                                                if (imageArray[indice] == "undefined" || imageArray[indice] == null || imageArray[indice] == "" || err) {
                                                                    imageArray[indice] = "image3.png"
                                                                }
                                                                //Add a while loop for if the rowArray == imageArray[indice].split(":")[0]; (so it's inside of a imageArray.forEach())
                                                                for (var i = 0; i < rowArray.length; i++) {
                                                                    if (imageArray == null || imageArray[i] == "" || imageArray[i] == "undefined") {
                                                                        break
                                                                    }
                                                                    //else if(rowArray[i] == imageArray[i].split(":")[0]){ //This is the logic that needs to be changed!
                                                                    // imageArray.push(imageArray[i].split(":")[0]);
                                                                    //}
                                                                    //else if(rowArray[i] != imageArray[i].split(":")[0]){
                                                                    // imageArray.push(imageArray[i].split(":")[0]);
                                                                    //}
                                                                }

                                                                //if not, redo the loop for another neume
                                                                if (imageArray[indice] == "undefined" || imageArray[indice] == null || imageArray[indice] == "" || err) {
                                                                    imageArray[indice] = ["0", "image3.png"]
                                                                } else {
                                                                    if (imageArray[indice].split(":")[1] == "undefined" || imageArray[indice].split(":")[1] == null || imageArray[indice].split(":")[1] == "" || err) {
                                                                        console.log("no image");
                                                                    } else {

                                                                        //console.log(rowArray[indice]);
                                                                        //neume.find(row : imageArray[indice].split(":")[0]){
                                                                        //  update({
                                                                        //  imageMedia : imageArray[indice].split(":")[1]
                                                                        //})
                                                                        //}

                                                                        //I just need to get the imageArray value that includes the rowArray[indice]


                                                                        var index, value, result;
                                                                        for (index = 0; index < imageArray.length; ++index) {
                                                                            value = imageArray[index];
                                                                            console.log(value.split(":")[0] + "hey");
                                                                            console.log(rowArray[indice] + "you");
                                                                            if (value.split(":")[0].replace(" ", "") == rowArray[indice]) {
                                                                                // You've found it, the full text is in `value`.
                                                                                // So you might grab it and break the loop, although
                                                                                // really what you do having found it depends on
                                                                                // what you need.
                                                                                result = value.split(":")[1].replace(" ", "");
                                                                                console.log("The result is : " + result)
                                                                                break;
                                                                            }
                                                                        }
                                                                        console.log(result);

                                                                        mongoose.model('neume').find({
                                                                            _id: neume._id
                                                                        }).update({
                                                                            row: rowArray[indice],
                                                                            imageMedia: result //adding the image to the image array without reinitializng everything
                                                                        }, function(err, neume1) {
                                                                            //console.log(imageArray[0].split(":")[0]);//This is undefined
                                                                            var imageFilePath = imageArray[0].split(":")[0];

                                                                            mongoose.model("neume").find({
                                                                                row: imageFilePath
                                                                            }).update({
                                                                                imageMedia: "." //This didnt get updated
                                                                            }, function(err, neumeElement) {
                                                                                if (err) {
                                                                                    res.send("There was a problem updating the information to the database: " + err);
                                                                                } else { //console.log(neumeElement);
                                                                                }
                                                                            })

                                                                        })
                                                                    }
                                                                }

                                                                indice++;
                                                            })
                                                        });
                                                    };

                                                    mongoose.model("neume").find({
                                                        $and: [{
                                                            classifier: originalFileName
                                                        }, {
                                                            project: IdOfProject
                                                        }]
                                                    }, function(err, neumes) {
                                                        neumes.forEach(function(neume) { //Change this to a for loop to make the data faster. Right now the performance is almost 5 minutes.     
                                                            var image = neume.imageMedia;
                                                            //console.log(image);
                                                            if (fs.existsSync('exports/xl/media/' + image)) {
                                                                var imgPath = 'exports/xl/media/' + image; //This is undefined. 
                                                                var A = storedImages;
                                                                var a = new A;
                                                                a.projectID = IdOfProject;
                                                                a.neumeID = neume._id;
                                                                a.img.data = fs.readFileSync(imgPath);
                                                                a.img.contentType = 'image/png';
                                                                a.imgBase64 = a.img.data.toString('base64');

                                                                imageData.push(a.img.data.toString('base64')); //This works for all the images stored in the database.
                                                                //console.log(imageData); //This works
                                                                mongoose.model('neume').find({
                                                                    _id: neume._id
                                                                }).update({
                                                                        //push the neumes into the imagesBinary array
                                                                        imagePath: 'exports/xl/media/' + neume.imageMedia,
                                                                        imagesBinary: fs.readFileSync('exports/xl/media/' + neume.imageMedia).toString('base64')
                                                                    },

                                                                    function(err, data) {
                                                                        //console.log(err, data);
                                                                        imageData = [];

                                                                        a.save(function(err, a) {
                                                                            if (err) throw err;

                                                                            console.error('saved img to mongo');
                                                                        });
                                                                    });
                                                            }

                                                        })

                                                    });
                                                });
                                            }
                                        }

                                    }

                                })
                                if (fs.existsSync('./exports/xl/drawings/drawing1.xml') && fs.existsSync("./exports/xl/drawings/_rels/drawing1.xml.rels")) {
                                    mongoose.model('neume').find({
                                        project: req.body.IdOfProject
                                    }, function(err, neumeElements) {
                                        neumeElements.forEach(function(element) {

                                            //console.log(element.imageMedia);
                                            var image = element.row;
                                            var fs = require("fs");

                                            if (fs.existsSync('exports/xl/media/' + image)) { //This is making wayyy too many files in the storedImages collection
                                                //if(file.name == neume.field)
                                                //if(neume.indice == fileNameIndice){
                                                var imgPath = 'exports/xl/media/' + image; //This is undefined. 

                                                // our imageStored model
                                                var A = storedImages;
                                                // store an img in binary in mongo
                                                var a = new A;
                                                a.neumeID = neumeElement._id;
                                                a.projectID = IdOfProject;
                                                a.img.data = fs.readFileSync(imgPath);
                                                a.img.contentType = 'image/png';
                                                a.imgBase64 = a.img.data.toString('base64');
                                                var imageData = [];
                                                imageData.push(a.img.data.toString('base64')); //This works for all the images stored in the database.
                                                //console.log(imageData)
                                                //All the images (images) need to be pushed to an array field in mongodb
                                                mongoose.model('neume').find({
                                                    id: element._id
                                                }).update({
                                                        //push the neumes into the imagesBinary array
                                                        imagePath: imgPath,
                                                        imagesBinary: imageData
                                                    },

                                                    function(err, data) {
                                                        //console.log(err, data);
                                                        imageData = [];



                                                        a.save(function(err, a) {
                                                            if (err) throw err;

                                                            console.error('saved img to mongo');
                                                        });
                                                    });
                                            }

                                        })
                                        // console.log(userFinal);//This works!!!
                                    });
                                }

                            })
                        })
                    //}
                }
                res.format({
                    html: function() {
                        res.redirect("back");
                    },
                    //JSON responds showing the updated values
                    json: function() {
                        res.json(project);
                    }
                });
            });

            //Delete the exports folder after the loading is done. 


            //1. I need to upload the excel file here
            var originalFileName = req.file.originalname;

            node_xj({
                input: req.file.path, // input xls
                output: "output.json", // output json // specific sheetname
                rowsToSkip: 0 // number of rows to skip at the top of the sheet; defaults to 0
            }, function(err, result) {
                if (err) {
                    console.error(err);
                } else {
                     //This is creating the neumes twice,
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        var fs = require('fs');

                                        //2. I need to unzip the file and add the unzipped content to a directory
                                        if (fileType == ".xlsx") {
                                            var unzip = require('unzipper');
                                            fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                                                path: './exports'
                                            }));
                                            //We now have all the folders from the zip file into the exports folder.
                                            //3. I need to go to dir/xl/media to get all the images
                                            //passsing directoryPath and callback function

                                            fs.readdir("./exports/xl/media", function(err, files) {
                                                //handling error
                                                if (err) {
                                                    return console.log('Unable to scan directory: ' + err);
                                                }
                                                //listing all files using forEach
                                                var indice = 1;
                                                files.forEach(function(file) {
                                                    var fs = require('fs');
                                                    var ind = 1;
                                                    //files.forEach(function (file) {
                                                    //var fileName = "image" + ind + ".png";
                                                    //fs.renameSync("exports/xl/media/" + file, "exports/xl/media/" + fileName);
                                                    //ind++;
                                                    //})
                                                    // Do whatever you want to do with the file
                                                    var fileNameIndice = "image" + indice + ".png";

                                                    //This part here works well.
                                                    //4. I need to add the images to the neumes by image name "image01, ect..."
                                                    //4.1 For each .png in the folder, change to binary file and add to mongoose find first neume, ect..
                                                    mongoose.model("neume").find({
                                                        $and: [{
                                                            classifier: originalFileName
                                                        }, {
                                                            project: IdOfProject
                                                        }]
                                                    }, function(err, neumes) {

                                                        //Then for each neume add a field called  indice + 'png'
                                                        var indice = 0;
                                                        neumes.forEach(function(neume) {
                                                            indice += 1;
                                                            var indiceValue = "image" + indice + ".png";

                                                            //update it
                                                            mongoose.model('neume').find({
                                                                _id: neume._id
                                                            }).update({
                                                                indice: "image" + indice + ".png" //adding the image to the image array without reinitializng everything
                                                            }, function(err, neume1) {

                                                                if (err) {
                                                                    res.send("There was a problem updating the information to the database: " + err);
                                                                } else {

                                                                    var imgPath = 'exports/xl/media/' + indiceValue; //This is undefined. 

                                                                    // our imageStored model
                                                                    var A = storedImages;
                                                                    // store an img in binary in mongo
                                                                    var a = new A;
                                                                    a.neumeID = neume._id;
                                                                    try {
                                                                        a.img.data = fs.readFileSync(imgPath);
                                                                    } catch {
                                                                        console.log(err);
                                                                    }
                                                                    a.img.contentType = 'image/png';
                                                                    try {
                                                                        a.imgBase64 = a.img.data.toString('base64');
                                                                    } catch {
                                                                        console.log(err);
                                                                    }
                                                                    var imageData = [];
                                                                    try {
                                                                        imageData.push(a.img.data.toString('base64'));
                                                                    } //This works for all the images stored in the database.
                                                                    catch {
                                                                        console.log(err);
                                                                    }
                                                                    //All the images (images) need to be pushed to an array field in mongodb
                                                                    mongoose.model('neume').find({
                                                                        _id: neume._id
                                                                    }).update({
                                                                            //push the neumes into the imagesBinary array
                                                                            imagePath: imgPath,
                                                                            imagesBinary: imageData
                                                                        },

                                                                        function(err, data) {
                                                                            //console.log(err, data);
                                                                            imageData = [];



                                                                            a.save(function(err, a) {
                                                                                if (err) throw err;

                                                                                console.error('saved img to mongo');
                                                                            });
                                                                        });

                                                                    console.log(project.positionArray);

                                                                }
                                                            })
                                                        })
                                                        //Add a timeout to delete everything in the exports folder here once the operation of adding the neumes to the database is finished
                                                    });

                                                    console.log(file);
                                                });
                                                indice = 1;

                                            });
                                        }
                                    }
                             
                }
            });

            //4. I need to add the images to the neumes by image name "image01, ect..."
            //4.1 For each .png in the folder, change to binary file and add to mongoose find first neume, ect..
            //5. Redirect the page to the project page

        }

        if (fileType == ".csv") {

            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
            var nameOfProject = req.body.projectName;
            var csvParser = require('csv-parse');
            var file = req.file.buffer;

            const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
            var fs = require('fs');
            var dir = './exports';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(filePath, file, function(err) {
                console.log(file); //This is just the name
            });


        }

        if (fileType == ".csv") {
            // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
            // This will parse a delimited string into an array of
            // arrays. The default delimiter is the comma, but this
            // can be overriden in the second argument.

            function CSVToArray(strData, strDelimiter) {
                strData = strData.trim();
                // Check to see if the delimiter is defined. If not,
                // then default to comma.
                strDelimiter = (strDelimiter || ",");
                // Create a regular expression to parse the CSV values.
                var objPattern = new RegExp((
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
                // Create an array to hold our data. Give the array
                // a default empty first row.
                var arrData = [
                    []
                ];
                // Create an array to hold our individual pattern
                // matching groups.
                var arrMatches = null;
                // Keep looping over the regular expression matches
                // until we can no longer find a match.
                while (arrMatches = objPattern.exec(strData)) {
                    // Get the delimiter that was found.
                    var strMatchedDelimiter = arrMatches[1];
                    // Check to see if the given delimiter has a length
                    // (is not the start of string) and if it matches
                    // field delimiter. If id does not, then we know
                    // that this delimiter is a row delimiter.
                    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push([]);
                    }
                    // Now that we have our delimiter out of the way,
                    // let's check to see which kind of value we
                    // captured (quoted or unquoted).
                    if (arrMatches[2]) {
                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[2].replace(
                            new RegExp("\"\"", "g"), "\"");
                    } else {
                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[3];
                    }
                    // Now that we have our value string, let's add
                    // it to the data array.
                    arrData[arrData.length - 1].push(strMatchedValue);
                }
                // Return the parsed data.
                return (arrData);
            }

            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
            var nameOfProject = req.body.projectName;
            var csvParser = require('csv-parse');
            var file = req.file.buffer;

            const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
            var fs = require('fs');
            var dir = './exports';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(filePath, file, function(err) {
                console.log(file); //This is just the name
            });

            const csv = require('csvtojson');
            ////THIS IS WHERE THE REAL CSV FILE IS UPLOADED
            csv()
                .fromFile(req.file.path)
                .then((jsonObj) => {

                    mongoose.model("neume").insertMany(jsonObj)
                        .then(function(jsonObj) {

                            jsonObj.forEach(function(neume) {
                                mongoose.model("neume").find({
                                    _id: neume.id
                                }).update({
                                    project: IdOfProject,
                                    mei: neume.mei.replace(/[\u2018\u2019]/g, "'")
                                        .replace(/[\u201C\u201D]/g, '"')
                                }, function(err, neumeElement) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        console.log(neumeElement);
                                    }
                                })

                            })

                            res.redirect("back");
                        })
                        .catch(function(err) {
                            err = "Please, only upload the csv file downloaded from the project."
                            return res.format({
                                html: function() {
                                    res.render('errorLog', {
                                        "error": err,
                                    });
                                },
                                json: function() {
                                    res.json(err);
                                }
                            });
                        });
                });
        }

        if (fileType == ".docx") { // Each filetype has their own route. In the future, we could also do different files for each 
            //Didn't add the classifier field to the neumes here!
            var fs = require("fs");
            var originalFileName = req.file.originalname;
            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 

            const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
            var fs = require('fs');
            var dir = './docx'; //join the path name with this folder.

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(filePath, file, function(err) {
                console.log(file); //This is just the name
            });

            ////For the images, we unzip the files and we get the images from the unzipped files in media again, just like for the excel file
            var unzip = require('unzipper');
            try {
                fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                    path: './exports'
                }));
            } catch (e) {
                console.log('Caught exception: ', e);
            }

            var mammoth = require("mammoth"); //mammoth might take away 

            const HtmlTableToJson = require('html-table-to-json');

            mammoth.convertToHtml({ // Mammoth library used for converting the docx to html, since parsing an html table is much easier
                    path: pathName.join(__dirname, "..", req.file.path)
                })
                .then(function(result) {
                    var html = result.value; // The generated HTML
                    fs.writeFile("file.html", result.value, function(err) {
                        if(err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");
                    }); 
                    const HtmlTableToJson = require('html-table-to-json');
                    fs.readFile("file.html", {
                        encoding: 'utf-8'
                    }, function(err, data) {
                        if (!err) {
                            console.log('received data: ' + data);
                            const html = data.toString(); //# Paste your HTML table

                    var HTMLParser = require('node-html-parser');
 
                    var root = HTMLParser.parse(html);
                    var Tables = root.querySelectorAll('tr');
                    tables.forEach(function(table){
                        var rows = table.querySelectorAll('td')
                        console.log("Each row has : " + rows.rawText);
                    })
                    console.log(root.querySelector('td').rawText);
                    

                    for (var i = 1; i < jsonTables['results'][0].length; i++) {

                        var json = jsonTables['results'][0][i];
                        json = JSON.parse(JSON.stringify(json).split('"1":').join('"image":'));
                        json = JSON.parse(JSON.stringify(json).split('"2":').join('"name":'));
                        json = JSON.parse(JSON.stringify(json).split('"3":').join('"folio":'));
                        json = JSON.parse(JSON.stringify(json).split('"4":').join('"description":'));
                        json = JSON.parse(JSON.stringify(json).split('"5":').join('"classification":'));
                        json = JSON.parse(JSON.stringify(json).split('"6":').join('"mei":'));
                        console.log(json);
                        //json = JSON.stringify(json);
                        mongoose.model("neume").insertMany(json)
                            .then(function(jsonObj) {

                                jsonObj.forEach(function(neume) {
                                    mongoose.model("neume").find({
                                        _id: neume.id
                                    }).update({
                                        classifier: originalFileName,
                                        project: IdOfProject,
                                        mei: neume.mei.replace(/[\u2018\u2019]/g, "'")
                                            .replace(/[\u201C\u201D]/g, '"')
                                    }, function(err, neumeElement) {
                                        if (err) {
                                            res.send("There was a problem updating the information to the database: " + err);
                                        } else {
                                            //So column 1 is images binary, 2 is name, 3 is folio, 4 is description, 5 is classification and 6 is mei encoding
                                            console.log(arrayJson);
                                            for (var laptopItem in arrayJson) {}

                                            var messages = result.messages; // Any messages, such as warnings during conversion

                                            var dir = './exports';
                                            var fs = require("fs");
                                            if (!fs.existsSync(dir)) {
                                                fs.mkdirSync(dir);
                                            }

                                            var fs = require('fs');
                                            if (fs.existsSync('./exports/word/document.xml') && fs.existsSync("./exports/word/_rels/document.xml.rels")) {
                                                fs.readFile("./exports/word/document.xml", function(err, data) {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    let xmlParser = require('xml2json');
                                                    let xmlString = data.toString();
                                                    //console.log('JSON output', xmlParser.toJson(xmlString));
                                                    var jsonObj = xmlParser.toJson(xmlString);
                                                    var jsonArray = [];
                                                    jsonArray = jsonObj.split(',');
                                                    //console.log(jsonArray);
                                                    var rowArray = [];
                                                    var imageArray = [];
                                                    var a = 0;
                                                    for (var i = 0; i < jsonArray.length; i++) {
                                                        //console.log(jsonArray[i] + "hey") 
                                                        if (jsonArray[i].includes("\"wp:docPr\":")) { //console.log(jsonArray[i].split(":")[2]);
                                                            var rowValue = jsonArray[i].split(":")[2]; //this is the xdr:row that we have from the element

                                                        }
                                                        if (jsonArray[i].includes("\"r:embed\":")) {
                                                            //console.log(jsonArray[i].split(":")[2]);
                                                            var rowWithId = jsonArray[i].split(":")[6];
                                                            try{rowWithId = rowWithId.replace("\}", "");}
                                                            catch(err){
                                                                console.log(err);
                                                            }
                                                            rowArray.push(rowWithId);
                                                            //console.log(rowArray); //This works perfectly
                                                            //An error happens when the neume gets all the files
                                                            fs.readFile("./exports/word/_rels/document.xml.rels", function(err, data) {
                                                                if (err) {
                                                                    var err = 'Error : You cannot upload an old version of excel. Please make sure that your version of excel is updated.';
                                                                    return res.format({
                                                                        html: function() {
                                                                            res.render('errorLog', {
                                                                                "error": err,
                                                                            });
                                                                        },
                                                                        json: function() {
                                                                            res.json(err);
                                                                        }
                                                                    });

                                                                } else {
                                                                    let xmlParser = require('xml2json');
                                                                    let xmlString = data.toString();
                                                                    //console.log('JSON output', xmlParser.toJson(xmlString));
                                                                    var jsonObj = xmlParser.toJson(xmlString);
                                                                    var jsonArray = [];
                                                                    var rowValue = "";
                                                                    jsonArray = jsonObj.split(',');
                                                                    //console.log(jsonArray);
                                                                    imageArray = [];

                                                                    for (var i = 0; i < jsonArray.length; i++) {
                                                                        //console.log(jsonArray[i] + "hey") 
                                                                        if (jsonArray[i].includes("Id")) { //console.log(jsonArray[i].split(":")[2] );
                                                                            rowValue = jsonArray[i].split(":")[2];
                                                                            if (jsonArray[i].split(":")[2] == null || jsonArray[i].split(":")[2] == "") {
                                                                                rowValue = jsonArray[i].split(":")[1];
                                                                            }

                                                                            //this is the xdr:row that we have from the element

                                                                        }
                                                                        if (jsonArray[i].includes("media")) {
                                                                            //console.log(jsonArray[i].split(":")[1]);
                                                                            var rowWithId = jsonArray[i].split(":")[1].split("/")[1]; //This needs to be shown on the console to understand what this is.
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\]", "");
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\}", "");
                                                                            rowWithId = rowWithId.replace("\"", "");

                                                                            var element = rowValue.concat(" : " + rowWithId);
                                                                            imageArray.push(element);
                                                                            //console.log(imageArray); //This works perfectly
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        };

                                                    }


                                                    mongoose.model("neume").find({
                                                        $and: [{
                                                            classifier: originalFileName
                                                        }, {
                                                            project: IdOfProject
                                                        }]
                                                    }, function(err, neumesElements) {
                                                        var indice = 0;
                                                        console.log("Row array before of 0 is : " + rowArray[0]); //This is always shown!!
                                                        console.log(neumesElements._id)
                                                        neumesElements.forEach(function(neume) { //Change this to a for loop to make the data faster. Right now the performance is almost 5 minutes.
                                                            console.log("Row array of 0 is : " + rowArray[0]); //This doesnt show.
                                                            if (imageArray[indice] == "undefined" || imageArray[indice] == null || imageArray[indice] == "" || err) {
                                                                imageArray[indice] = "image3.png"
                                                            }
                                                            //Add a while loop for if the rowArray == imageArray[indice].split(":")[0]; (so it's inside of a imageArray.forEach())
                                                            for (var i = 0; i < rowArray.length; i++) {
                                                                if (imageArray == null || imageArray[i] == "" || imageArray[i] == "undefined") {
                                                                    break
                                                                }

                                                            }

                                                            //if not, redo the loop for another neume
                                                            if (imageArray[indice] == "undefined" || imageArray[indice] == null || imageArray[indice] == "" || err) {
                                                                imageArray[indice] = ["0", "image3.png"]
                                                            } else {
                                                                if (imageArray[indice].split(":")[1] == "undefined" || imageArray[indice].split(":")[1] == null || imageArray[indice].split(":")[1] == "" || err) {
                                                                    console.log("no image");
                                                                } else {

                                                                    var index, value, result;
                                                                    for (index = 0; index < imageArray.length; ++index) {
                                                                        value = imageArray[index];
                                                                        console.log(value.split(":")[0] + "hey");
                                                                        console.log(rowArray[indice] + "you");
                                                                        if (value.split(":")[0].replace(" ", "") == rowArray[indice]) {
                                                                            // You've found it, the full text is in `value`.
                                                                            // So you might grab it and break the loop, although
                                                                            // really what you do having found it depends on
                                                                            // what you need.
                                                                            result = value.split(":")[1].replace(" ", "");
                                                                            console.log("The result is : " + result)
                                                                            break;
                                                                        }
                                                                    }
                                                                    console.log(result);

                                                                    mongoose.model('neume').find({
                                                                        _id: neume._id
                                                                    }).update({
                                                                        row: rowArray[indice],
                                                                        imageMedia: result //adding the image to the image array without reinitializng everything
                                                                    }, function(err, neume1) {
                                                                        var imageFilePath = imageArray[0].split(":")[0];

                                                                        mongoose.model("neume").find({
                                                                            row: imageFilePath
                                                                        }).update({
                                                                            imageMedia: "." //This didnt get updated
                                                                        }, function(err, neumeElement) {
                                                                            if (err) {
                                                                                res.send("There was a problem updating the information to the database: " + err);
                                                                            } else { //console.log(neumeElement);
                                                                            }
                                                                        })

                                                                    })
                                                                }
                                                            }

                                                            indice++;
                                                        })
                                                    });


                                                    mongoose.model("neume").find({
                                                        $and: [{
                                                            classifier: originalFileName
                                                        }, {
                                                            project: IdOfProject
                                                        }]
                                                    }, function(err, neumes) {
                                                        neumes.forEach(function(neume) { //Change this to a for loop to make the data faster. Right now the performance is almost 5 minutes.     
                                                            var image = neume.imageMedia;

                                                            if (fs.existsSync('exports/word/media/' + image)) {
                                                                var imgPath = 'exports/word/media/' + image; //This is undefined. 
                                                                var A = storedImages;
                                                                var a = new A;
                                                                a.projectID = IdOfProject;
                                                                a.neumeID = neume._id;
                                                                try{a.img.data = fs.readFileSync(imgPath);}
                                                                catch(err){
                                                                    console.log(err)
                                                                }
                                                                a.img.contentType = 'image/png';
                                                                try{a.imgBase64 = a.img.data.toString('base64');}
                                                                catch(err){
                                                                    console.log(err)
                                                                }

                                                                try{imageData.push(a.img.data.toString('base64'));}
                                                                catch(err){
                                                                    console.log(err)
                                                                } //This works for all the images stored in the database.
                                                                //console.log(imageData); //This works
                                                                mongoose.model('neume').find({
                                                                    _id: neume._id
                                                                }).update({
                                                                        //push the neumes into the imagesBinary array
                                                                        imagePath: 'exports/word/media/' + neume.imageMedia,
                                                                        imagesBinary: fs.readFileSync('exports/word/media/' + neume.imageMedia).toString('base64')
                                                                    },

                                                                    function(err, data) {
                                                                        //console.log(err, data);
                                                                        imageData = [];

                                                                        a.save(function(err, a) {
                                                                            if (err) throw err;

                                                                            console.error('saved img to mongo');
                                                                        });
                                                                    });
                                                            }

                                                        })

                                                    });
                                                });
                                            }
                                        }
                                    })

                                })
                            })
                        arrayJson.push(json); //Array to keep the values of the json object in the database
                    }

                    }
                })


                    res.redirect('back');
                })
                .done();

        }
        if (fileType == ".html") {
            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created. 
            var fs = require('fs');
            const filePath = pathName.join(__dirname, "..", req.file.path) //This works
            const HtmlTableToJson = require('html-table-to-json');
            fs.readFile(filePath, {
                encoding: 'utf-8'
            }, function(err, data) {
                if (!err) {
                    console.log('received data: ' + data);
                    const html = data.toString(); //# Paste your HTML table

                    const jsonTables = new HtmlTableToJson(html);
                    var arrayJson = [];

                    for (var i = 1; i < jsonTables['results'][0].length; i++) {

                        var json = jsonTables['results'][0][i];
                        json = JSON.parse(JSON.stringify(json).split('"1":').join('"imagesBinary":'));
                        json = JSON.parse(JSON.stringify(json).split('"2":').join('"name":'));
                        json = JSON.parse(JSON.stringify(json).split('"3":').join('"folio":'));
                        json = JSON.parse(JSON.stringify(json).split('"4":').join('"description":'));
                        json = JSON.parse(JSON.stringify(json).split('"5":').join('"classification":'));
                        json = JSON.parse(JSON.stringify(json).split('"6":').join('"mei":'));
                        //json = JSON.stringify(json);
                        mongoose.model("neume").insertMany(json)
                            .then(function(jsonObj) {

                                jsonObj.forEach(function(neume) {
                                    mongoose.model("neume").find({
                                        _id: neume.id
                                    }).update({
                                        project: IdOfProject,
                                        mei: neume.mei.replace(/[\u2018\u2019]/g, "'")
                                            .replace(/[\u201C\u201D]/g, '"')
                                    }, function(err, neumeElement) {
                                        if (err) {
                                            res.send("There was a problem updating the information to the database: " + err);
                                        } else {
                                            console.log(neumeElement);
                                        }
                                    })

                                })
                            })
                        arrayJson.push(json);
                    }
                    //So column 1 is images binary, 2 is name, 3 is folio, 4 is description, 5 is classification and 6 is mei encoding
                    console.log(arrayJson);
                    for (var laptopItem in arrayJson) {}



                    res.redirect('back');

                } else {
                    console.log(err);
                }
            });

        }

    });


router.route('/csvProject')
    .post(function(req, res) {

        var IdOfProject = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;

        mongoose.model('neume').find({
            project: IdOfProject
        }, function(err, neumeCSV) {
            if (err) {
                return res.status(500).json({
                    err
                });
            } else {
                //var neume = neume;
                console.log(neumeCSV);
                let csv
                try {
                    csv = json2csv(neumeCSV, {
                        fields
                    });
                } catch (err) {
                    return res.status(500).json({
                        err
                    });
                }
                const dateTime = moment().format('YYYYMMDDhhmmss');
                const filePath = pathName.join(__dirname, "..", "exports", "csv-" + IdOfProject + "_" + dateTime + ".csv")
                var fs = require('fs');
                var dir = './exports';

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                fs.writeFile(filePath, csv, function(err) { //This gives an error
                    if (err) {
                        return res.json(err).status(500);
                    } else {
                        setTimeout(function() {
                            fs.unlinkSync(filePath); // delete this file after 30 seconds
                        }, 30000)
                        return res.download(filePath);
                    }
                });

            }
        }) //global.userFinal = []; //The user needs to be added in all the routes

    });

router.route('/fork')
    .post(function(req, res) {

        var IdOfProject = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;

        mongoose.model('neume').find({
            project: IdOfProject
        }, function(err, neumeCSV) { //This gets all the neumes from the project
            if (err) {
                return res.status(500).json({
                    err
                });
            } else {
                mongoose.model('User').findById(req.session.userId, function(err, user) {
                    if (err) {
                        return console.error(err);
                    } else {

                        //1.We need to create a copy of the project
                        var name = user.username + "/" + nameOfProject; //We'll start with the userID added to the name, then we'll change it to the username
                        var projectUserID = req.session.userId;
                        var projectArray = [];
                        projectArray.push(projectUserID) //3.Add that project to the user. 
                        mongoose.model('project').create({
                            name: name,
                            userID: projectArray //This will be the userID

                        }, function(err, project) {
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
                                    var classification = neumeFork.classification;
                                    var mei = neumeFork.mei;
                                    var dob = neumeFork.dob;
                                    var ID_project = project._id;
                                    var review = neumeFork.review;

                                    //call the create function for our database
                                    mongoose.model('neume').create({
                                        name: name,
                                        folio: folio,
                                        description: description,
                                        classification: classification,
                                        mei: mei,
                                        review: review,
                                        dob: dob,
                                        imagePath: imageArray,
                                        project: ID_project

                                    }, function(err, neume) {
                                        if (err) {
                                            res.send("There was a problem adding the information to the database.");
                                        } else {
                                            mongoose.model('neume').find({
                                                project: ID_project
                                            }, function(err, neumes) {
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
                                                a.neumeID = neume._id; //This is the neume id of the element
                                                a.img.contentType = 'image/png';
                                                a.imgBase64 = image;
                                                imageData.push(a.imgBase64); //This works for all the images stored in the database.

                                                //All the images (images) need to be pushed to an array field in mongodb
                                                mongoose.model('neume').findOneAndUpdate({
                                                        _id: neume._id
                                                    }, {
                                                        //push the neumes into the imagesBinary array
                                                        imagesBinary: imageData
                                                    },

                                                    function(err, data) {
                                                        //console.log(err, data);
                                                        imageData = [];
                                                    });


                                                a.save(function(err, a) {
                                                    if (err) throw err;

                                                    console.error('saved img to mongo');
                                                });

                                            });

                                            imageArray = [];

                                        }

                                    })

                                })
                                res.format({
                                    html: function() {
                                        res.redirect("/projects/");
                                    },
                                    //JSON responds showing the updated values
                                    json: function() {
                                        res.json(user);
                                    }
                                });
                            }

                        })

                    }
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
            .exec(function(error, user) {
                //update it
                user.update({
                    bio: bio //adding the image to the image array without reinitializng everything
                }, function(err, user) {
                    if (err) {
                        res.send("There was a problem updating the information to the database: " + err);
                    } else {
                        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                        res.format({
                            html: function() {
                                res.redirect("back");
                            },
                            //JSON responds showing the updated values
                            json: function() {
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

        User.findOne({
                username: userSettings
            })
            .exec(function(err, user) {
                if (err) {
                    return dialog.info("error");
                } else {

                    if (user == null) {
                        //find the document by ID
                        User.findById(req.session.userId)
                            .exec(function(error, user) {
                                //update it
                                user.update({
                                    username: userSettings

                                }, function(err, user) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                                        res.format({
                                            html: function() {
                                                res.redirect("back");
                                            },
                                            //JSON responds showing the updated values
                                            json: function() {
                                                res.json(user);
                                            }
                                        });
                                    }
                                })
                            });
                    } else {
                        var err = new Error('Username already taken. Please try again');
                        return res.format({
                            html: function() {
                                res.render('errorLog', {
                                    "error": err,
                                });
                            },
                            json: function() {
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
        User.findOne({
                email: emailSettings
            })
            .exec(function(err, userEmail) {
                if (err) {
                    return dialog.info("error");
                } else {

                    if (userEmail == null) {
                        //find the document by ID
                        User.findById(req.session.userId)
                            .exec(function(error, user) {
                                //update it
                                user.update({
                                    email: emailSettings

                                }, function(err, user) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                                        res.format({
                                            html: function() {
                                                res.redirect("back");
                                            },
                                            //JSON responds showing the updated values
                                            json: function() {
                                                res.json(user);
                                            }
                                        });
                                    }
                                })
                            });
                    } else {
                        var err = new Error('Email already taken. Please try again.');
                        return res.format({
                            html: function() {
                                res.render('errorLog', {
                                    "error": err,
                                });
                            },
                            json: function() {
                                res.json(err);
                            }
                        });
                    }
                }
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

        mongoose.model('project').findOneAndUpdate({
                _id: project
            }, {
                $push: {
                    userID: userCollab
                }
            })
            .exec(function(err, data) {

                if (data.admin == userCollab) {
                    //find the document by ID
                    var err = new Error('The collaborator you want to add is the admin of the project. You cannot add them again as a collaborator.');
                    return res.format({
                        html: function() {
                            res.render('errorLog', {
                                "error": err,
                            });
                        },
                        json: function() {
                            res.json(err);
                        }
                    });
                } else {
                    mongoose.model('project').findById(project, function(err, project) {
                        projectCollabName = project.name;
                        console.log(projectCollabName); //This works!!!
                    });

                    mongoose.model('User').findById(userCollab, function(err, user) {
                        userCollabName = user.username;
                        console.log(userCollabName); //This works!!!


                        //find the document by ID
                        User.findById(req.session.userId)
                            .exec(function(error, user) {
                                //update it
                                user.update({
                                    $push: {
                                        collaborators: {
                                            nameCollab: userCollab,
                                            projectID: project,
                                            collabUserName: userCollabName,
                                            collabProjectName: projectCollabName
                                        } //inserted data is the object to be inserted 
                                    }
                                }, function(err, user) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
                                        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                                        res.format({
                                            html: function() {
                                                res.redirect("back");
                                            },
                                            //JSON responds showing the updated values
                                            json: function() {
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
    .post(function(req, res) {
        var userCollab = req.body.collabName;
        var projectCollab = req.body.collabProject;

        mongoose.model('project').findOneAndUpdate({
                _id: projectCollab
            }, {
                $pull: {
                    userID: userCollab
                }
            },

            function(err, data) {
                console.log(err, data);
            });

        mongoose.model('User').findById(req.session.userId, function(err, user) {

            if (err) {
                return console.error(err);
            } else {
                //This works, when the page is reloaded
                mongoose.model('User').findOneAndUpdate({
                        _id: user._id
                    }, {
                        $pull: {
                            collaborators: {
                                nameCollab: userCollab,
                                projectID: projectCollab
                            } //inserted data is the object to be inserted 
                        }
                    },

                    function(err, data) {
                        console.log(err, data);
                    });

                //Deleting the element from the userArray
                for (var i = 0; i < userArray.length; i++) {
                    if (userArray[i] === userCollab) {
                        userArray.splice(i, 1);
                    }
                }

                res.format({
                    //HTML returns us back to the main page, or you can create a success page
                    html: function() {
                        //res.redirect("back");
                        res.redirect("/profile");
                    },
                    //JSON returns the item with the message that is has been deleted
                    json: function() {
                        res.json({
                            message: 'deleted',
                            item: user
                        });
                    }

                });
            }
        });
    });
//POST route for updating data
router.post('/', function(req, res, next) {
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
            bio: req.body.bio,
            active: false
        }
        User.findOne({
                $or: [{
                    username: req.body.username
                }, {
                    email: req.body.email
                }]
            })
            .exec(function(err, user) {
                if (err) {
                    return dialog.info("error");
                } else {

                    if (user == null) {
                        //find the document by ID
                        User.findById(req.session.userId)
                            .exec(function(error, user) {
                                //update it
                                User.create(userData, function(err, user) {
                                    if (err) {
                                        res.send("There was a problem updating the information to the database: " + err);
                                    } else {
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
                                                user.active = true; //Change this afterwards.
                                                user.resetActiveTokendExpires = Date.now() + 3600000; // 1 hour

                                                user.save(function(err) {
                                                    done(err, token, user);
                                                });

                                            },
                                            function(token, user, done) {
                                                const sgMail = require('@sendgrid/mail');
                                                sgMail.setApiKey(SENDGRID_API_KEY);
                                                const msg = {
                                                    to: user.email,
                                                    from: 'cress-noreply@demo.com',
                                                    subject: 'Cress Confirmation Email',
                                                    text: 'You are receiving this because you have created an account with Cress.\n\n' +
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
                                        var err = 'Success! You can now log-in to Cress.';
                                        return res.format({
                                            html: function() {
                                                res.render('errorLog', {
                                                    "error": err,
                                                });
                                            },
                                            json: function() {
                                                res.json(err);
                                            }
                                        });
                                    }
                                })
                            });
                    } else {
                        var err = new Error('Email/Username already taken. Please try again');
                        return res.format({
                            html: function() {
                                res.render('errorLog', {
                                    "error": err,
                                });
                            },
                            json: function() {
                                res.json(err);
                            }
                        });
                    }
                }
            });



    } else if (req.body.logemail && req.body.logpassword) {

        User.authenticateByEmail(req.body.logemail, req.body.logpassword, function(error, user) {

            if (error || !user) {
                User.authenticateByUsername(req.body.logemail, req.body.logpassword, function(error, username) {
                    console.log(username); //This is undefined
                    if (error || !username) {
                        var err = new Error('Wrong email/username or password. Please try again.'); //When entering the right email/user/password, this is going on.
                        return res.format({
                            html: function() {
                                res.render('errorLog', {
                                    "error": err,
                                });
                            },
                            json: function() {
                                res.json(err);
                            }
                        });
                    } else {
                        if (username.active == false) {
                            var err = new Error('Account not activated. To activate your account, a confirmation email has been sent to you. Please confirm your account before proceeding.');
                            return res.format({
                                html: function() {
                                    res.render('errorLog', {
                                        "error": err,
                                    });
                                },
                                json: function() {
                                    res.json(err);
                                }
                            });

                        }

                        req.session.userId = username._id;
                        return res.redirect('/projects');
                    }

                });
            } else {
                if (user.role == "editor") {
                    req.session.userId = user._id;
                    return res.redirect('/projects');
                }
                if (user.active == false) {
                    var err = new Error('Account not activated. To activate your account, a confirmation email has been sent to you. Please confirm your account before proceeding.');
                    return res.format({
                        html: function() {
                            res.render('errorLog', {
                                "error": err,
                            });
                        },
                        json: function() {
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
            html: function() {
                res.render('errorLog', {
                    "error": err,
                });
            },
            json: function() {
                res.json(err);
            }
        });
    }
})

router.get('/confirm/:token', function(req, res) {
    User.findOneAndUpdate({
        activeToken: req.params.token,
        resetActiveTokendExpires: {
            $gt: Date.now()
        }
    }, {
        active: true
    }, function(err, user) {
        if (!user) {
            var err = new Error('Confirmation reset token is invalid or has expired.');
            return res.format({
                html: function() {
                    res.render('errorLog', {
                        "error": err,
                    });
                },
                json: function() {
                    res.json(err);
                }
            });
        }
        var err = 'Success! Your account has been activated, you can now log-in to Cress.';
        return res.format({
            html: function() {
                res.render('errorLog', {
                    "error": err,
                });
            },
            json: function() {
                res.json(err);
            }
        });
    });
});
// GET route after registering
router.get('/profile', function(req, res, next) {
    var usersSelect = [];
    global.projectsUsers = [];
    mongoose.model('project').find({
        userID: req.session.userId
    }, function(err, projects) {
        if (err) {
            return console.error(err);
        } else {
            projectsUsers = projects;

            mongoose.model('User').find({
                _id: {
                    $nin: [req.session.userId]
                }
            }, function(err, users) {
                if (err) {
                    return console.error(err);
                } else {
                    usersSelect = users;

                    User.findById(req.session.userId)
                        .exec(function(error, user) {
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
                                        html: function() {
                                            res.render('profile', {
                                                "username": user.username,
                                                "email": user.email,
                                                "status": user.role,
                                                "bio": user.bio,
                                                "collaborators": user.collaborators,
                                                "users": usersSelect,
                                                "projects": projectsUsers
                                            });
                                        },
                                        json: function() {
                                            res.json(project);
                                        }
                                    });

                                }
                            }
                        });
                }
            });
        }
    });
});
// Update the information on the database
router.post('/profile', function(req, res, next) {

    var username = req.body.name;
    var email = req.body.email;
    var bio = req.body.bio;
    var collaborators = req.body.collaborators;

    User.findById(req.session.userId)
        .exec(function(error, user) {
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
                        html: function() {
                            res.redirect("back");
                        },
                        json: function() {
                            res.json(project);
                        }
                    });
                }
            }
        });
});

// GET for logout logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;