/**
 * Created by jopes on 2015-12-20.
 */

// Requirements
var version = require("./.version");
var validator = require('validator');
var xssFilters = require('xss-filters');
var mongoSanitize = require('mongo-sanitize');

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

    // Save marker
    server.post(baseRoute, function (req, res, next) {

        // Init and parse variables
        var lat = parseFloat(req.params.lat),
            lon = parseFloat(req.params.lon),
            source = validator.whitelist(req.params.source, ".@a-zA-Z0-9À-ÖØ-öø-ÿ"),
            name = validator.whitelist(req.params.name, ".@a-zA-Z0-9À-ÖØ-öø-ÿ"),
            href = req.params.href;

        // Validate variables
        if (
            // Source
            !validator.isNull(source) &&
            validator.isLength(source, 1, 70) &&

            // Name
            !validator.isNull(name) &&
            validator.isLength(name, 1, 70) &&

            // href
            !validator.isNull(href) &&
            validator.isURL(href) &&
            validator.isLength(href, 1, 1000) &&

            // Latitude
            !validator.isNull(lat) &&
            validator.isFloat(lat, {min: -90, max: 90}) &&

            // Longitude
            !validator.isNull(lon) &&
            validator.isFloat(lon, {min: -180, max: 180})
        ) {

            // Create marker model, sanitize from mongodb sql injections and xss attacks
            var markerToSave = markerModel({
                source: mongoSanitize(xssFilters.uriInHTMLData(source)),
                name: mongoSanitize(xssFilters.uriInHTMLData(name)),
                href: mongoSanitize(xssFilters.uriInHTMLData(href)),
                location: { // GeoJSON specific declaration
                    type: "Point",
                    coordinates: [lon, lat]
                }
            });

            // Save marker in db
            markerToSave.save(function(error){

                if(error) {
                    return displayError(res, next);
                }

                // Display result
                res.send(200);
                return next();
            })
        }
        else {
            return displayError(res, next);
        }
    });

    // Save many markers
    server.post(baseRoute + "/multi", function (req, res, next) {

        console.log(req.params);

        // TODO: Implement multi marker posts
    })
};

