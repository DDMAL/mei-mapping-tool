var express = require('express');
var router = express.Router();

    const notes = require('../controllers/note.controller.js');

/* GET Userlist page. */
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('projects', { title: 'Express' });
});

module.exports = router;