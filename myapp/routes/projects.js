var express = require('express');
var router = express.Router();

/* GET Userlist page. */
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('projects', { title: 'Express' });
});

router.get('/', function(req, res, next) {
  res.render('projects', { title: 'Express' });
});


module.exports = router;