var mongoose = require('mongoose');

// define the schema for our user model
var tagSchema = mongoose.Schema({

    key: String,
    courses: [String]

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Tag', tagSchema);
