var mongoose = require('mongoose');  
var imageSchema = new mongoose.Schema({  
  path: String,
//Make sure the image path is linked to the user id
//The images always have a new id
  dob: { type: Date, default: Date.now }
});
mongoose.model('image', imageSchema);