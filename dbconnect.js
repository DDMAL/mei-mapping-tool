const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const mongo_port = process.env.MONGO_PORT || 27017;

const connect = mongoose.connect(`mongodb://localhost:${mongo_port}/mei-mapping-tool`, {useNewUrlParser:true});

module.exports = connect;
