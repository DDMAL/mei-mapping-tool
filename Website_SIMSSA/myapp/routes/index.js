var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/file-upload', upload_files.array('source_file[]'), process_upload); 
module.exports = router;
