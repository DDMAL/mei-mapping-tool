var mongoose = require('mongoose');  
const Schema = mongoose.Schema;
var projectSchema = new mongoose.Schema({  
  name: String,
//Make sure the image path is linked to the user id
//The images always have a new id
  dob: { type: Date, default: Date.now },
  neumes : [Buffer]
});

mongoose.model('project', projectSchema);