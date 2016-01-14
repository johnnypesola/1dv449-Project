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
var Marker = require('../../model/BLL/marker');
var MarkerDAL = require('../../model/DAL/markerDAL');

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

    var saveMarker = function(marker, res, next) {

        // Create promise
        var deferred = q.defer();

        // Convert to DAL object
        marker = new MarkerDAL(marker);

        // Save marker in db
        marker.save(function (error) {

                if (error) {

                    console.log(error);

                    return displayError(res, next);
                }

                // Resolve promise
                deferred.resolve();
            });

        // Return promise
        return deferred.promise;
    };

// Public API calls

    // Get all markers
    /* Disabled for now. Needs authentication.

    server.get(baseRoute, function (req, res, next) {

        // Find all/
        MarkerDAL.find({}, function(error, results) {

            if(error){
                return displayError(res, next)
            }

            // Display results
            res.send(results);
            return next();
        })
    });
    */

    // Returns all markers near given longitude and latitude values
    server.get(baseRoute + "/all-near", function (req, res, next) {

        var lat = parseFloat(req.query.lat),
            lon = parseFloat(req.query.lon),
            dis = parseFloat(req.query.dis),
            src = req.query.src,
            earthsRadius = 6371,
            distanceInKiloMeters = 10/earthsRadius;

        // Optinal distance parameter check.
        if(dis !== null && validator.isInt(dis, {min: 1, max: 200})){
            distanceInKiloMeters = dis/earthsRadius;
        }

        // Optinal src parameter check
        if(src !== null && validator.whitelist(src, ".@a-zA-Z0-9À-ÖØ-öø-ÿ")){
            src = mongoSanitize(src);
        }
        else {
            src = null;
        }


        // Required parameters check
        if (
            lat !== null &&
            validator.isFloat(lat, {min: -90, max: 90}) &&

            lon !== null &&
            validator.isFloat(lon, {min: -180, max: 180})

        ) {

            // Get near markers from database
            MarkerDAL.geoNear([lon, lat], {
                maxDistance: distanceInKiloMeters,
                spherical : true,
                distanceField: "distance",
                query: ( src === null ? null : { source: src })
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
    /* Disabled for now. Needs authentication.

    server.del(baseRoute, function(req, res, next) {

        var id = (req.params._id);

        // Validate id
        if(validator.isMongoId(id)){

            // Try to remove document
            MarkerDAL.remove(
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
     */

    // Remove all markers
    /* Disabled for now. Needs authentication.

    server.del(baseRoute + "/clear", function(req, res, next) {

        // Try to remove document
        MarkerDAL.remove(
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
     */

    // Save marker
    /* Disabled for now. Needs authentication.

    server.post(baseRoute, function (req, res, next) {

        // Create marker BLL object
        var marker = new Marker(
            req.params.lat,
            req.params.lon,
            req.params.source,
            req.params.href,
            req.params.name
        );

        if(marker.IsValid()){
            marker.SanitizeModel();

            saveMarker(marker, res, next)

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

        }
    });
     */

    // Save many markers
    /* Disabled for now. Needs authentication.

    server.post(baseRoute + "/multi", function (req, res, next) {

        var containerObj = req.params;

        // Check that we got an array.
        if(Array.isArray(containerObj)){

            console.log("Got multi marker post");

            // Loop trough markers
            containerObj.forEach(function(values){

                // Create marker BLL object
                var marker = new Marker(
                    values.lat,
                    values.lon,
                    values.source,
                    values.href,
                    values.name
                );

                if(marker.IsValid()) {
                    marker.SanitizeModel();

                    // Save marker
                    saveMarker(marker, res, next)

                    // All went well
                        .then(function(){

                            console.log("saved marker: " + marker.name);

                        })
                        // An error occured
                        .catch(function(){
                            displayError(res, next);
                        });
                }
            });

            // Display result
            res.send(200);
            return next();
        }
        else {
            displayError(res, next);
        }
    })
     */
};

