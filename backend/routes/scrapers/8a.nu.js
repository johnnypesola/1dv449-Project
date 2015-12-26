/**
 * Created by jopes on 2015-12-20.
 */

var Scraper = require('./../../model/scraper');
var q = require('q');
var request = require('request');

// Url to scrape
var baseUrl = "http://www.8a.nu/";
var baseHrefUrl = "http://www.8a.nu/crags/";
var urlToScrape = "http://www.8a.nu/crags/Map.aspx?CountryCode=GLOBAL";

// Route strings setup
var siteFullName = "8a";
var siteName = "8a";
var baseRoute = "/scrapers/" + siteName;

var targetApiAddress = "http://localhost:3000/v1.0/markers/multi";

// Create Scraper
var scraperObj = new Scraper(baseUrl);

/* ### Example response objects
 *  Markers are embedded in the html on the target page inside a script tag.
 L.marker([44.420901762813585, 33.916683197021484]).addTo(map).bindPopup('<a href=\'Crag.aspx?CragId=31291\'>&#1052;orchek&#1072;</a>    62 ascents');
 L.marker([46.27625828810938, 14.964408874511719]).addTo(map).bindPopup('<a href=\'Crag.aspx?CragId=29286\'>&#268;reta</a>    998 ascents');
 */

module.exports = function( server ) {

// Private methods
    var displayError = function(res, next){
        res.send(500);
        return next;
    };

// Public API calls

    server.get(baseRoute + "/getall", function (req, res, next) {

        // Define an array that should contain parsed markers
        var markerRawData;
        var markersToSaveArray = [];

        // Private methods
        var parsePage = function(){

            // Create promise
            var deferred = q.defer();

            // Scrape the url
            scraperObj.getFileAsHtml("temp-data/8a.nu.html")
            //scraperObj.getAsHtml(urlToScrape)
                .then(function (doc) {

                    console.log("Started parsing page. " + doc.length);

                    //console.log(doc);

                    // Get markers raw data in script tag
                    markerRawData = doc('script:contains("L.marker([")').text();

                    // Decode UTF8
                    //markerRawData = iconv.decode(markerRawData, "utf8");

                    // Remove whitespace and linebreaks
                    markerRawData = markerRawData.replace(/(\r\n|\n|\r|\s\s+)/gm," ");

                    // Get start and end positions for marker data
                    var toParseStart = markerRawData.indexOf("L.marker([");
                    var toParseEnd = markerRawData.length;

                    // Get marker raw data
                    markerRawData = markerRawData.substring(toParseStart, toParseEnd);

                    console.log("Page is parsed: " + markerRawData.length);

                    // Resolve promise
                    deferred.resolve();
                })

                .catch(function (error) {

                    // Reject promise
                    deferred.reject(error);

                    console.log(error);

                    displayError(res, next);
                });

            // Return promise
            return deferred.promise;
        };

        var parseValuesToArray = function() {

            var dataRows, filteredDataRows, lat, lon, href, name, markerToSave;

            // Split into rows
            dataRows = markerRawData.split("L.marker");

            // Remove accommodation-specific marker data and empty rows
            filteredDataRows = dataRows.filter(function(value){
                return (
                    value.indexOf("icon: L.AwesomeMarkers.icon") === -1 && // Accommodation
                    value.indexOf("[") > -1) ; // Empty rows
            });

            // Now we have rows with the following example data. Lets parse the data that we need.
            // ([59.90024343415689, 10.856906175613403]).addTo(map).bindPopup('<a href=\'Crag.aspx?CragId=28809\'>Østmarka</a> 3 280 ascents');

            // Parse each row
            filteredDataRows.forEach(function(dataRow ,index){

                // Parse data
                lat = /\[([\-0-9]+(\.[0-9]+)?),/g.exec(dataRow)[1];
                lon = /\,\s([\-0-9]+(\.[0-9]+)?)\]\)/g.exec(dataRow)[1];
                href = /a\shref\=\\\'([a-zA-Z0-9\?\=\.]+)\\\'/g.exec(dataRow)[1];
                name = /\\\'\>([^\<]+)<\/a\>/g.exec(dataRow)[1];

                // Put data in new marker object
                markerToSave = {
                    source: siteFullName,
                    name: name,
                    href: baseHrefUrl + href,
                    lon: lon,
                    lat: lat
                };

                markersToSaveArray.push(markerToSave);
            });

            console.log("Elements are parsed: " + markersToSaveArray.length);
        };

        var postToApi = function (){

            // Post to API
            request.post(targetApiAddress, {json: markersToSaveArray}, function(error, response, html){

                console.log("Posted markers to API");

                // Forward statuscode
                res.send(response.statusCode);

                // return JSON output
                //res.json(markersToSaveArray, {'content-type': 'application/json; charset=utf-8'});

                return next();
            });
        };

        // Init code
        try {
            parsePage()
                .then(function(){

                    parseValuesToArray();

                    postToApi();
                })
        }
        catch (error){
            displayError(res, next);
        }
    });
};

