var mongoose = require('mongoose');  
const Schema = mongoose.Schema;

var schema = new Schema({
 name : String,
 neumeIDs : [Schema.Types.ObjectId]
});

var section = module.exports = mongoose.model('section', schema);
module.exports = section;