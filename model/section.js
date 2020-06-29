var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    neumeIDs: [String],
    projectID: String
});

var section = module.exports = mongoose.model('section', schema);
module.exports = section;