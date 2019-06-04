var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
//Change this line to the database you want the user name and password to be posted to
mongoose.connect("mongodb://localhost:27017/userDatabase");

//Testing the database for the project schema:
var projectSchema = new mongoose.Schema({
    projectName : String,
    projectUser : String
});
//Making a mongoose model with the projects schema
var project = mongoose.model("projectNeumes",projectSchema);
/* GET Userlist page. */
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('projects', { title: 'Express' });
});

router.post("/projectsNeumes", (req, res) => {
    var projectData = new project(req.body)
    var nameProject = req.body.projectName;
    // a document instance
    var book1 = new project({ name: 'Introduction to Mongoose', price: 10, quantity: 25 });
 projectData.create()
    book1.save()
       .then(item => {
            res.render('index',function (err, html) {
               res.send("not saved to database")
            })
              })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

module.exports = router;