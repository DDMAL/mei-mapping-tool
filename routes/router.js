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

        var pid = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
        var nameOfProject = req.body.projectName;

        var fileType = req.body.fileType;
        var originalFileName = req.file.originalname;

        if (fileType == '.xlsx') {

            // first is special version to get image cells
            // second is to convert to csv
            // csv parse is so that we can convert
            // we do xlsx -> csv -> json so that empty rows aren't skipped
            // if there are empty rows which are ignored, then it messes up the image-neume association

            var Excel = require('exceljs');
            var XLSX = require('xlsx');
            var csvparse = require('csv-parse/lib/sync');

            var workbook = XLSX.readFile(req.file.path);
            // want to get first sheet, but it's an object not a list, so convert it
            var first_sheet_name = Object.keys(workbook['Sheets'])[0];
            var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[first_sheet_name]);
            var neumes = csvparse(csv, {
                columns: true,
                skip_empty_lines: false
            })

            // initialize the imagesbinary array
            for (let neume of neumes) {
                neume['imagesBinary'] = [];
            }

            // get the version which has image position information
            workbook = new Excel.Workbook();

            // now extract the images
            var fs = require('fs');
            var unzip = require('unzipper');
            var dir = './exports';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            // extract the contents
            // unzipper sends the 'close' event when its done extracting everything
            // wait until then to make sure we can access all the images :)
            try {
                fs.createReadStream('./exports/' + req.file.originalname).pipe(unzip.Extract({
                    path: './exports'
                })).on('close', function () {
                    workbook.xlsx.readFile(req.file.path).then(function() {
                        var worksheet = workbook.worksheets[0];

                        // get the position of each image
                        var image_rows = worksheet['_media'].map(function (med) {
                            return med['range']['tl']['nativeRow'];
                        });

                        // get the index of each image
                        // since sometimes this differs from the order they are read
                        var image_inds = worksheet['_media'].map(function (med) {
                            return med['imageId'];
                        });

                        // get the extension type of each image
                        // this is so terrible but it seems to be what works
                        var image_extensions = worksheet['_media'][0]['worksheet']['_workbook']['media'].map(function (med) {
                            return med['extension'];
                        })

                        var image_bins = []

                        // get image binaries
                        // need the index so use regular for loop
                        for (var i = 0; i < image_extensions.length; i++) {
                            var path = './exports/xl/media/image' + (i+1).toString() + '.' + image_extensions[i];
                            var bin = fs.readFileSync(path).toString('base64');
                            image_bins.push(bin);
                        }

                        // add the images to the correct neumes!
                        // and if an image is outside the bounds then we ignore it :)

                        // need the index so use regular for loop
                        for (var i = 0; i < image_rows.length; i++) {
                            var row = image_rows[i];
                            if (row > 0 && row <= neumes.length) { 
                                neumes[Number(row) - 1]['imagesBinary'].push(image_bins[i]) 
                            };
                        }

                        // delete any empty entries
                        // filter the list of neumes, using the condition that
                        // at least one values in the object is non-empty
                        neumes = neumes.filter(function(neume) {
                            return Object.values(neume).some(function(val) {

                                // val.length checks for string or array length :)
                                // and the expression val.length != 0 returns True when x is a number :)
                                return (val !== null && val.length != 0);
                            })
                        });

                        // add the project id and classifier
                        // note this needs to be done at the end so that we can easily filter out blank rows

                        // also we want to convert each of the keys to lower case to allow more flexibility
                        // so if the column header is "Name" it can go into the database as 'name'
                        // and any entries which don't match the model will just be ignored by mongo so we can leave them
                        for (let neume of neumes) {
                            neume['project'] = pid;
                            neume['classifier'] = originalFileName;
                            for (let key of Object.keys(neume)) {
                                if (key != (lower = key.toLowerCase())) {
                                    neume[lower] = neume[key];
                                }
                            }
                        }

                        // insert the neumes and delete the images once the binaries are saved in the db
                        mongoose.model("neume").insertMany(neumes)
                            .then(function(output){
                                var del = require('del');
                                const deletedPaths = del.sync('./exports/xl/media/*');
                                res.format({
                                    html: function() {
                                        res.redirect("/projects/" + pid);
                                    },
                                    //JSON responds showing the updated values
                                    json: function() {
                                        res.json(output);
                                    }
                                });
                            })
                        
                    })
                });

            } catch (e) {
                logger.info('Caught exception: ', e);
            }

            
        }

        if (fileType == ".csv") {
            var pid = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
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

            var pid = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
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
                                    project: pid,
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

        if (fileType == '.docx') {

            var fs = require('fs');
            var dir = './exports';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            var mammoth = require("mammoth");

            // Mammoth library used for converting the docx to html, since parsing an html table is much easier
            mammoth.convertToHtml({ 
                    path: req.file.path
                })
                .then(function(result) {

                    /* Format of the html table:
                    
                    table
                        tr (row)
                            td (cell)
                                p (contents, including the text)
                                    img (if there is one)
                    */


                    // get out the html data and find the table
                    var html = result.value;
                    const htmlparser = require('node-html-parser');
                    const root = htmlparser.parse(html);

                    // sometimes images appear in tables within tables
                    // so we can't easily account for multiple top level tables having neumes
                    // so just take the first one
                    var table = root.querySelectorAll('table')[0];
                    var rows = table['childNodes'];

                    // get the keys from the header row
                    var header = rows[0];
                    var keys = [];
                    for (let cell of header['childNodes']) {
                        var key = cell.firstChild.text;
                        keys.push(key);
                    }

                    var neumes = [];

                    // skip the header row
                    for (let row of rows.slice(1)) {

                        var vals = row['childNodes'];
                        var neume = {};

                        // need the index, so use a regular for loop
                        for (var i = 0; i < vals.length; i++) {

                            // get the p element
                            var val = vals[i].firstChild; 
                            
                            // if the cell is empty then continue
                            if (!val) {
                                continue;
                            }
                            // if it has images we need to extract them
                            // give some flexibility in the header name by using includes instead of ==
                            if (keys[i].toLowerCase().includes('image')) {

                                // query the cell instead of the p element just in case
                                var image_html_elements = vals[i].querySelectorAll('img');
                                var image_binaries = image_html_elements.map(function(el){

                                    // the src holds the image binary
                                    // but it has some information at the beginning (like base 64)
                                    // so get rid of that
                                    var fullstring = el.getAttribute('src')
                                    return fullstring.split(',')[1];

                                })
                                // remember to set the right name for the database
                                neume['imagesBinary'] = image_binaries;

                            }
                            else if (keys[i].toLowerCase().includes('class')) {
                                neume['classification'] = val.text;
                            }
                            else if (keys[i].toLowerCase().includes('encoding') || keys[i].toLowerCase().includes('mei')) {
                                neume['mei'] = val.text;
                            }
                            // otherwise just get the text
                            else {
                                // the database needs the values in lower case
                                // so if the header is 'Name' this catches that
                                neume[keys[i].toLowerCase()] = val.text;
                            }

                        }

                        neumes.push(neume);
                    }

                    // delete any empty entries
                    // filter the list of neumes, using the condition that
                    // at least one entry in the object is non-empty
                    neumes = neumes.filter(function(neume) {
                        return Object.values(neume).some(function(val) {

                            // val.length checks for string or array length :)
                            // and the expression val.length != 0 returns True when x is a number :)
                            return (val !== null && val.length != 0);
                        })
                    });

                    // add the project id and classifier
                    // note this needs to be done at the end so that we can easily filter out blank rows
                    for (let neume of neumes) {
                        neume['project'] = pid;
                        neume['classifier'] = originalFileName;
                    }

                    mongoose.model("neume").insertMany(neumes)
                        .then(function(output){
                                res.format({
                                    html: function() {
                                        res.redirect("/projects/" + pid);
                                    },
                                    //JSON responds showing the updated values
                                    json: function() {
                                        res.json(output);
                                    }
                                });
                        })

                })

        }

        if (fileType == ".html") {
            var pid = req.body.IdOfProject; // I need to add the id of the project to the neume I just created.
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
                                        project: pid,
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

        var pid = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;

        mongoose.model('neume').find({
            project: pid
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
                const filePath = pathName.join(__dirname, "..", "exports", "csv-" + pid + "_" + dateTime + ".csv")
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

// route for making a copy of a project
router.route('/makeCopy')
    .post(function(req, res) {

        var pid = req.body.IdOfProject;
        var nameOfProject = req.body.projectName;
        var newName = req.body.newName;

        mongoose.model('neume').find({
            project: pid
        }, function(err, neumeCSV) { //This gets all the neumes from the project
            if (err) {
                return renderError(res, err);
            } else {
                mongoose.model('User').findById(req.session.userId, function(err, user) {
                    if (err) {
                        return renderError(res, err);
                    } else {

                        //1.We need to create a copy of the project
                        var name = newName;
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
                                neumeCSV.forEach(function(newNeume) {
                                    var name = newNeume.name;
                                    var folio = newNeume.folio;
                                    var description = newNeume.description;
                                    var imageArray = newNeume.imagesBinary;
                                    var classification = newNeume.classification;
                                    var mei = newNeume.mei;
                                    var dob = newNeume.dob;
                                    var ID_project = project._id;
                                    var review = newNeume.review;

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