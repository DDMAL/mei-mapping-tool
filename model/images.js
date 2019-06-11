var mongoose = require('mongoose');  
var neumeSchema = new mongoose.Schema({  
  imagePath: String,
//Make sure the image path is linked to the user id
  dob: { type: Date, default: Date.now }
});
mongoose.model('image', imageSchema);