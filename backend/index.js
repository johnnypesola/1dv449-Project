/**
 * Created by jopes on 2015-12-19.
 */

// Require dependencies
var restify = require('restify');
var db = require('./model/dbService');
var mongoose = require('mongoose');

// Create server
var server = restify.createServer();

// Server options
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Start server
server.listen(3000, function () {
    console.log("Server started @ 3000");
});

// Require routes / endpoints
require('./routes/v1.0/markers')(server);

// Require scrapers
require('./routes/scrapers/sverigeforaren.se')(server);


