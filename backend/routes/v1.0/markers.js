/**
 * Created by jopes on 2015-12-20.
 */

// Requirements
var version = require("./.version");
var validator = require('validator');

// Require models
var markerModel = require('../../model/DAL/marker');

// Route strings setup
var name = "markers";
var baseRoute = "/" + version + "/" + name;

module.exports = function( server ){

    server.get(baseRoute, function (req, res, next) {


        res.send("Here you should get all the markers.");
        return next();
    });

    // Returns all markers near given longitude and latitude values
    server.get(baseRoute + "/all-near", function (req, res, next) {

        var lat = parseFloat(req.query.lat),
            lon = parseFloat(req.query.lon),
            distanceinMeters = 1000;

        // Required parameters check
        if(
            lat !== null &&
            validator.isFloat(lat, { min: -90, max: 90 }) &&

            lon !== null &&
            validator.isFloat(lon, { min: -180, max: 180 })
        ){

            console.log("yeah");

            // Get near markers from database
            markerModel.geoNear([lon, lat], { maxDistance : distanceinMeters, spherical : true })

                // Went ok.
                .then(function(results, stats) {

                    // Display results
                    res.send(results);
                    return next();
                });

                // An error occured TODO: mongoose does not support .catch() promises
                /*
                .catch(function(){

                    console.log("error occured");

                    res.send(500);
                    return next();
                })*/
        }
    });

};

