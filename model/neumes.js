var mongoose = require('mongoose');  
var neumeSchema = new mongoose.Schema({  
  name: String,
  folio: String,
  description: String,
  classification: String,
  mei: String,
  image: { data: Buffer, contentType: String },
  dob: { type: Date, default: Date.now },
});
mongoose.model('neume', neumeSchema);