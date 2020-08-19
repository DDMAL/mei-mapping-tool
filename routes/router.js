var express = require('express');
var router = express.Router();
var User = require('../model/User');
var bodyParser = require('body-parser');
var alert = require('alert-node');
const moment = require('moment');
const pathName = require('path');
const json2csv = require('json2csv').parse;
const fields = ['imagePath', 'imagesBinary', 'name', 'folio',
    'description', 'classification', 'mei', 'review', 'dob',
    'project', 'neumeSection', 'neumeSectionName'
];
global.userArray = [];
global.userArray = [];
var dialog = require('dialog');
var mongoose = require('mongoose');
var async = require('async');
var crypto = require('crypto');
var flash = require('express-flash');
var storedImages = require('../model/storedImages');
var SENDGRID_API_KEY = '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';
var logger = require('../logger');
var renderError = require('../public/javascripts/error');

router.use(flash());

router.use(bodyParser.json({
    limit: '50mb'
}));

router.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

// necessary stuff for file IO
var multer = require('multer');
var uploadCSV = multer({
    dest: 'exports/'
});

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

var userFinal = [];

// load the index page, and flag that we're logged out
router.get('/', function(req, res, next) {
    req.session.userId = null;
    return res.render('index')
});

//POST route for updating data
router.post('/', function(req, res, next) {
    var editor = false;
    req.session.userId = null; // set logged out

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.passwordConf) {
            var err = new Error('Passwords do not match. Try again');
            return renderError(res, err);
        }

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
                    return renderError(res, err);
                } else {
                    if (user == null) {
                        User.create(userData, function(err, user) {
                            if (err) {
                                return renderError(res, err);
                            } else {
                                async.waterfall([
                                    function(done) {
                                        crypto.randomBytes(30, function(err, buf) {
                                            if (err) {
                                                return renderError(res, err);
                                            }
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
                                // use the error logger page to show a success message
                                var err = 'Success! You can now log-in to Cress';
                                return renderError(res, err);
                            }
                        })
                    } else {
                        var err = new Error('Email/Username already taken. Please try again');
                        return renderError(res, err);
                    }
                }
            });



    } else if (req.body.logemail && req.body.logpassword) {

        User.authenticateByEmail(req.body.logemail, req.body.logpassword, function(error, user) {

            if (error || !user) {
                User.authenticateByUsername(req.body.logemail, req.body.logpassword, function(error, username) {
                    logger.info(username); //This is undefined
                    if (error || !username) {
                        var err = new Error('Wrong email/username or password. Please try again.');
                        return renderError(res, err);
                    } else {
                        if (username.active == false) {
                            var err = 'Account not activated. To activate your account, a confirmation email' +
                                'has been sent to you. Please confirm your account before proceeding.';
                            return renderError(res, err);
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
                    return renderError(res, err);
                }

                req.session.userId = user._id;
                return res.redirect('/projects');
            }

        });
    } else {
        var err = new Error('All fields are required.');
        return renderError(res, err);
    }
});

/*Forget Password Page*/
router.get('/forgot', function(req, res) {
    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                return renderError(res, err);
            } else {
                if (user === null) {
                    var err = new Error('Not Authorized.');
                    return renderError(res, err);
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

// post forgot password page
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                if (err) {
                    return renderError(res, err);
                }
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
                    return renderError(res, err);
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
            return renderError(res, err);
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
            return renderError(res, err);
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
                    return renderError(res, err);
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
        var logged_in;
        // see if the user is logged in
        if (req.session.userId === null) {
            userFinal = null;
            logged_in = false;
        } else {
            logged_in = true;
            mongoose.model('User').find({
                _id: req.session.userId
            }, function(err, users) {
                userFinal = users;
            });
        }
        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
            //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
            html: function() {
                logger.info(userFinal);
                res.render('about.jade', {
                    title: 'About',
                    "users": userFinal,
                    "loggedin": logged_in
                });
            },
            //JSON response will show all projects in JSON format
            json: function() {
                res.json(projects);
            }
        });
    });

// route for uploading a file, csv xlsx etc
router.route('/uploadFile')
    .post(uploadCSV, function(req, res) {

        var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
        var nameOfProject = req.body.projectName;

        var fileType = req.body.fileType;
        logger.info(fileType); //This is docx
        var originalFileName = req.file.originalname;

        if (fileType == '.xlsx') {
            // first is special version to get image cells
            // second is for reading the rest
            var lsxlsx = require('ls-xlsx');
            var XLSX = require('xlsx');
            var workbook = lsxlsx.readFile(req.file.path);
            // want to get first sheet, but it's an object not a list, so convert it
            var first_sheet_name = Object.keys(workbook['Sheets'])[0];
            // extract the image information including position
            var images = workbook['Sheets'][first_sheet_name]['!images'];

            workbook = XLSX.readFile(req.file.path);
            var neumes = XLSX.utils.sheet_to_json(workbook.Sheets[first_sheet_name]);
            // add the missing project and classifier information
            for (let neume of neumes) {
                neume['project'] = IdOfProject;
                neume['classifier'] = originalFileName;
                neume['imagesBinary'] = [];
            }

            // now extract the images and add them to the correct neumes
            var fs = require('fs');
            var unzip = require('unzipper');
            var dir = './exports';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            try {
                fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                    path: './exports'
                }));
            } catch (e) {
                logger.info('Caught exception: ', e);
            }

            // these two arrays are indexed per image
            // so one entry to each per image
            var imagebins = [];
            var imagepos = [];
            // get the image binaries
            for (let img of images) {
                var path = './exports/xl/media/' + img['name'];
                var bin = fs.readFileSync(path).toString('base64');
                var pos = img['position'];
                imagebins.push(bin);
                imagepos.push(pos);
            }

            // add the images to the correct neumes!
            // we assume the first neume is in the second row of the sheet and that no rows are skipped
            // also the image reading (in the imagepos array) ignores the header row
            // so that means row 1 in the imagepos array should correspond to the 0th element in our neume array :)
            // and if an image is outside the bounds then we ignore it :)

            // need the index so use regular for loop
            for (var i = 0; i < imagepos.length; i++) {
                var pos = imagepos[i];
                var row = pos['from']['row'];
                var neumepos = row - 1;
                if (neumepos >= 0 && neumepos < neumes.length) { 
                    neumes[neumepos]['imagesBinary'].push(imagebins[i]) 
                };
            }

            mongoose.model("neume").insertMany(neumes)
                .then(function(output){
                        res.format({
                            html: function() {
                                res.redirect("/projects/" + IdOfProject);
                            },
                            //JSON responds showing the updated values
                            json: function() {
                                res.json(output);
                            }
                        });
                })
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
                if (err) { return logger.error(res, err); }
                logger.info(file); //This is just the name
            });

            var IdOfProject = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
            var nameOfProject = req.body.projectName;
            var csvParser = require('csv-parse');
            var file = req.file.buffer;

            //const filePath = pathName.join(__dirname, "..", "exports", req.file.path) //This works
            var fs = require('fs');
            var dir = './exports';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(filePath, file, function(err) {
                logger.info(file); //This is just the name
            });

            const csv = require('csvtojson');
            csv()
                .fromFile(req.file.path)
                .then((jsonObj) => {

                    mongoose.model("neume").insertMany(jsonObj)
                        .then(function(jsonObj) {
                            // parse the neume image paths/image binaries, remove all instances of []\"
                            jsonObj.forEach(function(neume) {
                                mongoose.model("neume").find({
                                    _id: neume.id
                                }).update({
                                    project: IdOfProject,
                                    mei: neume.mei.replace(/[\u2018\u2019]/g, "'")
                                        .replace(/[\u201C\u201D]/g, '"'),
                                    imagePath: neume.imagePath.map(function(el) { return el.replace(/[\[\]"\\]/mg, ''); }),
                                    imagesBinary: neume.imagesBinary.map(function(el) { return el.replace(/[\[\]"\\]/mg, ''); })
                                }, function(err, neumeElement) {
                                    if (err) {
                                        return logger.error(res, err);
                                    } else {
                                        logger.info(neumeElement);
                                    }
                                })

                            })

                            res.redirect("back");
                        })
                        .catch(function(err) {
                            return logger.error(res, err);
                        });
                });
        }

        if (fileType == ".docx") {
            var imageNumber = -1;
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
                if (err) { return logger.error(res, err) };
                logger.info(file); //This is just the name
            });

            ////For the images, we unzip the files and we get the images from the unzipped files in media again, just like for the excel file
            var unzip = require('unzipper');
            try {
                fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                    path: './exports'
                }));
            } catch (err) {
                return logger.error(res, err);
            }

            var mammoth = require("mammoth"); //mammoth might take away
            const HtmlTableToJson = require('html-table-to-json');

            mammoth.convertToHtml({ // Mammoth library used for converting the docx to html, since parsing an html table is much easier
                    path: pathName.join(__dirname, "..", req.file.path)
                })
                .then(function(result) {
                    var html = result.value; // The generated HTML
                    //logger.info(html);
                    const html1 = html.toString(); //# Paste your HTML table
                    fs.writeFile("file.html", result.value, function(err) {
                        if (err) {
                            return logger.error(res, err);
                        }

                        logger.info("The file was saved!");
                    });
                    fs.readFile("file.html", {
                        encoding: 'utf-8'
                    }, function(err, data) {
                        if (!err) {
                            logger.info('received data: ' + data);
                            const html = data.toString(); //# Paste your HTML table

                            var HTMLParser = require('node-html-parser');
                            var neumeArray = [];
                            var root = HTMLParser.parse(html);
                            var tables = root.querySelectorAll('td');
                            var rows = root.querySelectorAll("tr");
                            var images = root.querySelectorAll("img").rawAttributes;
                            var images = root.querySelectorAll("img");
                            var imageArray = [];
                            images.forEach(function(image) {

                                var imageBinary = image.rawAttributes.src.split(",")[1];;
                                imageArray.push(imageBinary);

                            })
                            //logger.info(imageArray)
                            //logger.info(images)
                            var a = 0;
                            var x = 0;
                            var array = []
                            rows.forEach(function(row) {
                                for (var i = 0; i < 6; i++) {
                                    if (tables[a] == undefined)
                                        break
                                    var imageBinary = row.firstChild.firstChild;
                                    //logger.info(imageBinary)
                                    var AllRow = tables[a].rawText;
                                    //logger.info( i + " : " + AllRow);
                                    var imageBinary = imageArray[x];
                                    //logger.info(imageBinary)
                                    if (i == 0) {
                                        if (a != 0) {
                                            AllRow = imageBinary;
                                        } else {
                                            x--;
                                        }
                                    } else {
                                        AllRow = AllRow;
                                    }
                                    array.push(i + " : " + AllRow);
                                    a++;
                                }
                                x++;

                            })
                        }
                        else {
                            return logger.error(res, err);
                        }

                        //logger.info(array);
                        logger.info(array)



                        const jsonTables = new HtmlTableToJson(html1);
                        var arrayJson = [];

                        for (var i = 1; i < jsonTables['results'][0].length; i++) {

                            var json = jsonTables['results'][0][i];
                            json = JSON.parse(JSON.stringify(json).split('"1":').join('"image":'));
                            json = JSON.parse(JSON.stringify(json).split('"2":').join('"name":'));
                            json = JSON.parse(JSON.stringify(json).split('"3":').join('"folio":'));
                            json = JSON.parse(JSON.stringify(json).split('"4":').join('"description":'));
                            json = JSON.parse(JSON.stringify(json).split('"5":').join('"classification":'));
                            json = JSON.parse(JSON.stringify(json).split('"6":').join('"mei":'));
                            logger.info(json);
                            //json = JSON.stringify(json);

                            mongoose.model("neume").insertMany(json)
                                .then(function(jsonObj) {
                                    jsonObj.forEach(function(neume) {
                                        imageNumber = imageNumber + 1;
                                        mongoose.model("neume").find({
                                            _id: neume.id
                                        }).update({
                                            classifier: originalFileName,
                                            project: IdOfProject,
                                            imagesBinary: imageArray[imageNumber],
                                            mei: neume.mei.replace(/[\u2018\u2019]/g, "'")
                                                .replace(/[\u201C\u201D]/g, '"')
                                        }, function(err, neumeElement) {
                                            if (err) {
                                                return logger.error(res, err);
                                            } else {
                                                //So column 1 is images binary, 2 is name, 3 is folio, 4 is description, 5 is classification and 6 is mei encoding
                                                logger.info(arrayJson);
                                                for (var laptopItem in arrayJson) {}

                                                var messages = result.messages; // Any messages, such as warnings during conversion

                                                var dir = './exports';
                                                var fs = require("fs");
                                                if (!fs.existsSync(dir)) {
                                                    fs.mkdirSync(dir);
                                                }

                                                var fs = require('fs');

                                            }

                                        })

                                    })
                                })
                        }


                    });

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
                    logger.info('received data: ' + data);
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
                                            return logger.error(res, err);
                                        } else {
                                            logger.info(neumeElement);
                                        }
                                    })

                                })
                            })
                        arrayJson.push(json);
                    }
                    //So column 1 is images binary, 2 is name, 3 is folio, 4 is description, 5 is classification and 6 is mei encoding
                    logger.info(arrayJson);
                    for (var laptopItem in arrayJson) {}



                    res.redirect('back');

                } else {
                    return logger.error(res, err);
                }
            });

        }

    });

// route for downloading the csv for a project
router.route('/downloadCSV')
    .post(function(req, res) {

        var IdOfProject = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;

        mongoose.model('neume').find({
            project: IdOfProject
        }, function(err, neumeCSV) {
            if (err) {
                return renderError(res, err);
            } else {
                //var neume = neume;
                //logger.info(neumeCSV);
                let csv
                try {
                    csv = json2csv(neumeCSV, {
                        fields
                    });
                } catch (err) {
                    return renderError(res, err);
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
                        return renderError(res, err);
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

// route for forking someones project
router.route('/fork')
    .post(function(req, res) {

        var IdOfProject = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;

        mongoose.model('neume').find({
            project: IdOfProject
        }, function(err, neumeCSV) { //This gets all the neumes from the project
            if (err) {
                return renderError(res, err);
            } else {
                mongoose.model('User').findById(req.session.userId, function(err, user) {
                    if (err) {
                        return renderError(res, err);
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
                                return renderError(res, err);
                            } else {
                                //project has been created
                                logger.info('POST creating new project: ' + project);
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
                                            return renderError(res, err);
                                        } else {
                                            mongoose.model('neume').find({
                                                project: ID_project
                                            }, function(err, neumes) {
                                                neumeFinal = neumes;
                                                //logger.info(neumeFinal);//This works!!!
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
                                                        //logger.info(err, data);
                                                        imageData = [];
                                                    });


                                                a.save(function(err, a) {
                                                    if (err) return renderError(res, err);;

                                                    logger.info('saved img to mongo');
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
            .exec(function(err, user) {
                if (err) { return renderError(res, err); }
                //update it
                user.update({
                    bio: bio //adding the image to the image array without reinitializng everything
                }, function(err, user) {
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
                    return renderError(res, err);
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
                                        return renderError(res, err);
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
                        return renderError(res, err);
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
                    return renderError(res, err);
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
                                        return renderError(res, err);
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
                        return renderError(res, err);
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
                    return renderError(res, err);
                } else {
                    mongoose.model('project').findById(project, function(err, project) {
                        projectCollabName = project.name;
                        logger.info(projectCollabName); //This works!!!
                    });

                    mongoose.model('User').findById(userCollab, function(err, user) {
                        userCollabName = user.username;
                        logger.info(userCollabName); //This works!!!


                        //find the document by ID
                        User.findById(req.session.userId)
                            .exec(function(err, user) {
                                if (err) { return renderError(res, err); }
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
                                        return renderError(res, err);
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
                if (err) { return renderError(res, err); }
                logger.info(data);
            });

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
                                nameCollab: userCollab,
                                projectID: projectCollab
                            } //inserted data is the object to be inserted
                        }
                    },

                    function(err, data) {
                        if (err) { return renderError(res, err); }
                        logger.info(err, data);
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
            return renderError(res, err);
        }
        var err = 'Success! Your account has been activated, you can now log-in to Cress.';
        return renderError(res, err);
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
            return renderError(res, err);
        } else {
            projectsUsers = projects;

            mongoose.model('User').find({
                _id: {
                    $nin: [req.session.userId]
                }
            }, function(err, users) {
                if (err) {
                    return renderError(res, err);
                } else {
                    usersSelect = users;

                    User.findById(req.session.userId)
                        .exec(function(error, user) {
                            if (error) {
                                return renderError(res, err);
                            } else {
                                if (user === null) {
                                    return renderError(res, err);
                                } else {

                                    return res.format({
                                        html: function() {
                                            res.render('profile', {
                                                "username": user.username,
                                                "email": user.email,
                                                "status": user.role,
                                                "bio": user.bio,
                                                "collaborators": user.collaborators,
                                                "user": usersSelect,
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
                return renderError(res, err);
            } else {
                if (user === null) {
                    var err = new Error('Not Authorized.');
                    return renderError(res, err);
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