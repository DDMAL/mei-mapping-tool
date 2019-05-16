var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/meiMapping', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Userlist page. */
router.get('/', function(req, res) {
 
        res.render('user', {
            title: 'Express'
        });
    });


/* GET Userlist page. */
router.post('/projects', function(req, res) {
   
            res.redirect("projects");
        });

module.exports = router;
