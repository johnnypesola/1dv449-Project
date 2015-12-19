/**
 * Created by jopes on 2015-12-19.
 */

// Require dependencies
var restify = require('restify');
var mongoose = require('mongoose');
var credentials = require('./.mongoDbCredentials');

// Create server
var server = restify.createServer();

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
    console.log("Successfully connected to the database.")
});

// Server options
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Start server
server.listen(3000, function () {
    console.log("Server started @ 3000");
});

// Endpoints
server.get("/products", function (req, res, next) {
    res.send("You will see all the products in the collection with this end point");
    return next();
});

// Example mongodb document
// { "_id" : ObjectId("5674bbc699af4981418a5689"), "dataSource" : "Some site", "href" : "http://www.google.com", "GeoJSON" : { "type" : "Point", "coordinates" : [ 40, 5 ] } }
