/**
 * Created by jopes on 2015-12-20.
 */

var mongoose = require('mongoose');
var credentials = require('../.mongoDbCredentials');

// Connect to mongodb
var connectionOptions = {
    user: credentials.user,
    pass: credentials.pass
};

mongoose.connect('mongodb://127.0.0.1:27017/markers', connectionOptions);

// Store db connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

    // Connection success
    console.log("Successfully connected to the database.");

});


module.exports = db;
