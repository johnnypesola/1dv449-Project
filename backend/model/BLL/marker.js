/**
 * Created by jopes on 2015-12-26.
 */

var validator = require('validator');
var xssFilters = require('xss-filters');
var mongoSanitize = require('mongo-sanitize');

// Init constructor function
Marker = function(lat, lon, source, href, name){

    var that = this;

    // Init variables
    that.lat = lat;
    that.lon = lon;
    that.source = source;
    that.href = href;
    that.name = name;

    // Public methods
    that.IsValid = function(){

        // Init and parse variables
        var isValidReturnValue;

        that.lat = parseFloat(that.lat);
        that.lon = parseFloat(that.lon);
        that.source = validator.whitelist(that.source, ".@a-zA-Z0-9À-ÖØ-öø-ÿ");
        that.name = validator.whitelist(that.name, ".@a-zA-Z0-9À-ÖØ-öø-ÿ");

        // Validate variables
        isValidReturnValue = (
            // Source
            !validator.isNull(that.source) &&
            validator.isLength(that.source, 1, 70) &&

            // Name
            !validator.isNull(that.name) &&
            validator.isLength(that.name, 1, 70) &&

            // href
            !validator.isNull(that.href) &&
            validator.isURL(that.href) &&
            validator.isLength(that.href, 1, 1000) &&

            // Latitude
            !validator.isNull(that.lat) &&
            validator.isFloat(that.lat, {min: -90, max: 90}) &&

            // Longitude
            !validator.isNull(that.lon) &&
            validator.isFloat(that.lon, {min: -180, max: 180})
        );

        return isValidReturnValue;
    };

    // Sanitize from mongodb sql injections and xss attacks
    that.SanitizeModel = function(){

        that.source = mongoSanitize(xssFilters.inHTMLData(that.source));
        that.name = mongoSanitize(xssFilters.inHTMLData(that.name));
        that.href = mongoSanitize(xssFilters.inHTMLData(that.href));
        that.location = { // GeoJSON specific declaration
            type: "Point",
            coordinates: [that.lon, that.lat]
        };
    };
};

module.exports = Marker;
