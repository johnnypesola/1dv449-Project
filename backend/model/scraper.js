
// Module dependencies
var request = require('request'); // TODO: replace with http to have more control over responses

var http = require('http');
var cheerio = require('cheerio');
var robots = require('robots');
var q = require('q');

var Scraper = function(baseUrl){

    // Init Variables
    var that = this;
    var scraperAgentName = "scraperbot";

    // Create robots.txt parser
    var robotsParser = new robots.RobotsParser();

    // Private methods

    // Public methods
    this.checkForGetError = function(error, response, deferred){

        // Check if there was an error.
        if (error || response.statusCode != 200) {

            // Reject promise
            deferred.reject("ERROR: Got code '" + response.statusCode + "' fetching '" + url + "'");

            return true;
        }

        return false;
    };

    this.fetchPage = function(url, callback){

        var robotsTxtFile = that.fixUrl(baseUrl + "/robots.txt");

        // Prepare some options for request.js
        var requestOptions = {
            url: url,
            headers: {
                'User-Agent': scraperAgentName
            }
        };

        // Create promise
        var deferred = q.defer();

        // Get robots.txt
        robotsParser.setUrl(robotsTxtFile, function(robotsParser, success) {
            if (success) {

                // If its ok to fetch the target link according to robots.txt
                robotsParser.canFetch('*', '/' + that.stripBaseUrl(url), function (access) {
                    if (access) {

                        // Get the page specified in options
                        request(requestOptions, function(error, response, html) {

                            // In case there were no errors
                            if (!that.checkForGetError(error, response, deferred)) {

                                // Resolve promise
                                deferred.resolve(html);
                            }
                        });
                    }
                    else {
                        // Reject promise
                        deferred.reject("ERROR: robots.txt on host server prevents access to '" + url + "'");
                    }
                });
            }
            else {
                // Reject promise
                deferred.reject("ERROR: Occurred fetching robots.txt'");
            }
        });

        // Return promise
        return deferred.promise;
    };


    this.fixUrl = function(urlString){
        return urlString.replace(/([^:]\/)\/+/g, "$1");
    };

    this.stripBaseUrl = function(urlString){

        return urlString.replace(baseUrl, "");
    };

    this.getFileAsHtml = function(filePath){

        // Create promise
        var deferred = q.defer();

        var fs = require("fs");

        fs.readFile(filePath, function(error, html) {

            // Get jquery functionality with cheerio
            $ = cheerio.load(html);

            // Resolve promise
            deferred.resolve($);
        });

        // Return promise
        return deferred.promise;
    };

    this.getAsHtml = function(url){

        var $;

        // Create promise
        var deferred = q.defer();

        // Fetch the url
        that.fetchPage(url)

            // All went good
            .then(function(html) {

                // Get jquery functionality with cheerio
                $ = cheerio.load(html);

                // Resolve promise
                deferred.resolve($);
            })

            // An error occured
            .catch(function(errorMsg){

                // Reject promise
                deferred.reject(errorMsg);
            });

        // Return promise
        return deferred.promise;
    };

    this.parseNonStrictJson = function(value) {

        // Remove http(s):
        //value = value.replace(/(http)([s])?:/g, '');

        // Remove \" and ”
        value = value.replace(/\\"|”/g, '')

        // Add quotes to property keys
        .replace(/([a-zA-Z]+)([\s]+)?\:([\s]+)?(["'\{\[])/g, '"$1": $4')

        // Remove trailing extra commas before object closure, I mean this: ", }" and ", ]"
        .replace(/(,\s+)([\}\]])/g,'$2')

        // Replace ' with " in JSON property values
        .replace(/([a-zA-Z]\":[\s]?)'/g,'$1"').replace(/'([\s]+\})/g,'"$1')

        // Replace " with ' in html element properties
        .replace(/\"(?=[^<]*>)/g, "'");

        //return value;
        return JSON.parse(value);
    };
};

module.exports = Scraper;