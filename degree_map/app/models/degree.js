var mongoose = require('mongoose');

// define the schema for our user model
var degreeSchema = mongoose.Schema({

    shortname: String,
    name: String,
    courseGroups: [mongoose.Schema.Types.Mixed]

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Degree', degreeSchema);
