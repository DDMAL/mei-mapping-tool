const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const mongo_port = process.env.MONGO_PORT || 27017;

const connect = mongoose.connect(`mongodb://localhost:${mongo_port}/mei-mapping-tool`,
  {
    useNewUrlParser:true,
    useUnifiedTopology: true
  });

module.exports = connect;
