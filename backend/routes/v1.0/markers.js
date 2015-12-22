/**
 * Created by jopes on 2015-12-20.
 */

// Requirements
var version = require("./.version");
var validator = require('validator');
var xssFilters = require('xss-filters');
var mongoSanitize = require('mongo-sanitize');
var q = require('q');

// Require models
var markerModel = require('../../model/DAL/marker');

// Route strings setup
var name = "markers";
var baseRoute = "/" + version + "/" + name;

// Marker schema example
/*
 [
    {
        "_id":"5674bbc699af4981418a5689",
        "dataSource":"Some site",
        "href":"http://www.google.com",
        "GeoJSON":{
            "type":"Point",
            "coordinates":[40,5]
        },
        "location":{
            "coordinates":[],
            "type":"Point"
        },
            "date":"2015-12-21T15:07:58.431Z"
        }
]
 */

module.exports = function( server ) {

// Private methods
    var displayError = function(res, next){
        res.send(400);
        return next;
    };

    var saveMarker = function(values, res, next) {

        // Create promise
        var deferred = q.defer();

        // Init and parse variables
        var marker = {};

        marker.lat = parseFloat(values.lat);
        marker.lon = parseFloat(values.lon);
        marker.source = validator.whitelist(values.source, ".@a-zA-Z0-9À-ÖØ-öø-ÿ");
        marker.name = validator.whitelist(values.name, ".@a-zA-Z0-9À-ÖØ-öø-ÿ");
        marker.href = values.href;

        // Validate variables
        if (
            // Source
            !validator.isNull(marker.source) &&
            validator.isLength(marker.source, 1, 70) &&

                // Name
            !validator.isNull(marker.name) &&
            validator.isLength(marker.name, 1, 70) &&

                // href
            !validator.isNull(marker.href) &&
            validator.isURL(marker.href) &&
            validator.isLength(marker.href, 1, 1000) &&

                // Latitude
            !validator.isNull(marker.lat) &&
            validator.isFloat(marker.lat, {min: -90, max: 90}) &&

                // Longitude
            !validator.isNull(marker.lon) &&
            validator.isFloat(marker.lon, {min: -180, max: 180})
        ) {

            // Create marker model, sanitize from mongodb sql injections and xss attacks
            var markerToSave = markerModel({
                source: mongoSanitize(xssFilters.uriInHTMLData(marker.source)),
                name: mongoSanitize(xssFilters.uriInHTMLData(marker.name)),
                href: mongoSanitize(xssFilters.uriInHTMLData(marker.href)),
                location: { // GeoJSON specific declaration
                    type: "Point",
                    coordinates: [marker.lon, marker.lat]
                }
            });

            // Save marker in db
            markerToSave.save(function (error) {

                if (error) {
                    return displayError(res, next);
                }

                // Resolve promise
                deferred.resolve();
            })
        }
        else {
            // Reject promise
            deferred.reject();

            displayError(res, next);
        }

        // Return promise
        return deferred.promise;
    };

// Public API calls

    // Get all markers
    server.get(baseRoute, function (req, res, next) {

        // Find all
        markerModel.find({}, function(error, results) {

            if(error){
                return displayError(res, next)
            }

            // Display results
            res.send(results);
            return next();
        })
    });

    // Returns all markers near given longitude and latitude values
    server.get(baseRoute + "/all-near", function (req, res, next) {

        var lat = parseFloat(req.query.lat),
            lon = parseFloat(req.query.lon),
            earthsRadius = 6371,
            distanceInKiloMeters = 1/earthsRadius;


        // Required parameters check
        if (
            lat !== null &&
            validator.isFloat(lat, {min: -90, max: 90}) &&

            lon !== null &&
            validator.isFloat(lon, {min: -180, max: 180})
        ) {

            // Get near markers from database
            markerModel.geoNear([lon, lat], {
                maxDistance: distanceInKiloMeters,
                spherical : true,
                distanceField: "distance"
            }, function(error, results){

                if(error) {
                    return displayError(res, next);
                }

                // Display results
                res.send(results);
                return next();
            })
        }
        else {
            return displayError(res, next);
        }
    });

    // Remove marker
    server.del(baseRoute, function(req, res, next) {

        var id = (req.params._id);

        // Validate id
        if(validator.isMongoId(id)){

            // Try to remove document
            markerModel.remove(
                {
                    _id: mongoSanitize(id)
                },
                function(error){

                    if(error) {
                        return displayError(res, next);
                    }

                    // Display result
                    res.send(200);
                    return next();
                }
            )
        }
        else {
            return displayError(res, next);
        }
    });

    // Remove marker
    server.del(baseRoute + "/clear", function(req, res, next) {

        // Try to remove document
        markerModel.remove(
            {},
            function(error){

                if(error) {
                    return displayError(res, next);
                }

                // Display result
                res.send(200);
                return next();
            }
        )
    });

    // Save marker
    server.post(baseRoute, function (req, res, next) {

        // Save marker
        saveMarker(req.params, res, next)

            // All went well
            .then(function(){

                // Display result
                res.send(200);
                return next();
            })
            // An error occured
            .catch(function(){
                displayError(res, next);
            })
    });

    // Save many markers
    server.post(baseRoute + "/multi", function (req, res, next) {

        var containerObj = req.params;
        var isOkToContinue;

        // Check that we got an array.
        if(Array.isArray(containerObj)){

            console.log("Got multi marker post");

            // Loop trough markers
            containerObj.forEach(function(marker){

                //isOkToContinue = false;

                // Save marker
                saveMarker(marker, res, next)

                    // All went well
                    .then(function(){

                        console.log("saved marker" + marker.name);

//                        isOkToContinue = true;
                    })
                    // An error occured
                    .catch(function(){
                        displayError(res, next);
//                        return false;
                    });

//                while(!isOkToContinue){}

            });

            // Display result
            res.send(200);
            return next();
        }
        else {
            displayError(res, next);
        }



        /*
        req.params.forEach(function(marker, index){



            // Save marker
            //saveMarker(marker, res, next);

        });
        */
        // TODO: Implement multi marker posts
    })
};

