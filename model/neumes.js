var mongoose = require('mongoose');  
var neumeSchema = new mongoose.Schema({  
  name: String,
  folio: String,
  description: String,
  classification: String,
  mei: String,
//Make sure the image path is linked to the user id
  dob: { type: Date, default: Date.now },
});
mongoose.model('neume', neumeSchema);