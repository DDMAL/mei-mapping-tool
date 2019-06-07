var express = require('express');
var router = express.Router();
var auth = require("../controllers/AuthController.js");

// restrict index for logged in user only
router.get('/', function (req, res) {
    res.send('<html><head><title>Dropzone example</title><link href="/stylesheets/dropzone.css" rel="stylesheet"></head><body><h1>Using Dropzone</h1><form method="post" action="/" class="dropzone" id="dropzone-example"><div class="fallback"><input name="file" type="file" multiple /></div></form><p><a href="/old">Old form version</a></p><script src="/javascripts/dropzone.js"></script></body></html>');
});
// route to register page
router.get('/register', auth.register);

// route for register action
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);

// route for login action
router.post('/login', auth.doLogin);

// route for logout action
router.get('/logout', auth.logout);


module.exports = router;