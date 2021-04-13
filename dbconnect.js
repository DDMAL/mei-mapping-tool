const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const connect = mongoose.connect('mongodb://localhost:27017/mei-mapping-tool', {useNewUrlParser:true});

module.exports = connect;
