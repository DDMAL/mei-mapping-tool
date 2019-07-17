var mongoose = require('mongoose');  
const Schema = mongoose.Schema;

var schema = new Schema({
 img: { data: Buffer, contentType: String },
 neumeID : Schema.Types.ObjectId,
 imgBase64 : String
});

var imageStored = module.exports = mongoose.model('storedImages', schema);
module.exports = imageStored;