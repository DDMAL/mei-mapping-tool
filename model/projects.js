var mongoose = require('mongoose');  
const Schema = mongoose.Schema;
var projectSchema = new mongoose.Schema({  
  name: String,
//Make sure the image path is linked to the user id
//The images always have a new id
  dob: { type: Date, default: Date.now },
  neumeArray: [{ type: Schema.Types.ObjectId }],//Ref option is what tells mongoose which model to use during population
});

mongoose.model('project', projectSchema)