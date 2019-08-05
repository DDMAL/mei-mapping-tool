var mongoose = require('mongoose');  
const Schema = mongoose.Schema;
var neumeSchema = new mongoose.Schema({  
  name: String,
  folio: String,
  description: String,
  classification: String,
  mei: String,
  review : String,
//Make sure the image path is linked to the user id
  dob: { type: Date, default: Date.now },
  imagePath : [String],
  project: String,
  imagesBinary : [String],
  neumeSection : String,
  neumeSectionName : String
});
var Neume = module.exports = mongoose.model('neume', neumeSchema);

module.exports.getNeumeByProject = function(project, callback){
    User.Neume({project: project }, callback);
}