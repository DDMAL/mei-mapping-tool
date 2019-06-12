var mongoose = require('mongoose');  
const Schema = mongoose.Schema;
var neumeSchema = new mongoose.Schema({  
  name: String,
  folio: String,
  description: String,
  classification: String,
  mei: String,
//Make sure the image path is linked to the user id
  dob: { type: Date, default: Date.now },
  imagePath : [String]
});
mongoose.model('neume', neumeSchema);