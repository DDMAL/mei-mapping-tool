
//Note model : Contains the title and content fields
//Also added a timestamps option
//Adds automaticall two fields : createAt and updatedAt
const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,
    content: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema);