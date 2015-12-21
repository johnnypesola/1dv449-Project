/**
 * Created by jopes on 2015-12-20.
 */

var Scraper = require('./../../model/scraper');
var iconv = require('iconv-lite');

// Url to scrape
var baseUrl = "http://www.sverigeforaren.se/";
var urlToScrape = "http://www.sverigeforaren.se/search-results/?search_query=&tax_listings_categories=klippa&tax_listings_location=svealand&meta_listing_is_featured=&wpas=1";

// Route strings setup
var name = "sverigeforaren";
var baseRoute = "/scrapers/" + name;

// Create Scraper
var scraperObj = new Scraper(baseUrl);

/* ### Example response object
 *  Markers are embedded in the html on the target page inside a script tag.
 {
    latLng: [59.315073382079454,18.159622547885192],
    options: {
    icon: "",
    shadow: "",
 },
    data: '<div class="marker-wrapper  animated fadeInDown">
            <div class="marker-title">
                <a href="http://www.sverigeforaren.se/klattring/tandkulevagen/">Tändkulevägen</a>
            </div>
            <div class="marker-content">
                <div class="two_third popup-content">
                    <ul>
                        <li><span class="icon-direction"></span>Allmän information - Tändkulevägen Klippan vid Nacka Strand är väldigt lös till sin karaktär varför det finns vissa bestämmelser kring&hellip;</li>
                    </ul>
                    </div>
                    <div class="one_third last image-wrapper pop-image">
                        <a href="http://www.sverigeforaren.se/klattring/tandkulevagen/" title="Tändkulevägen">
                            <img src="http://www.sverigeforaren.se/wp-content/uploads/2013/12/no-picture-100x100.jpg" alt="Tändkulevägen"/>
                        </a>
                    </div>
                    <div class="clearboth"></div>
                    <div class="linker">
                        <a class="button black medium" href="http://www.sverigeforaren.se/klattring/tandkulevagen/">
                            Läs mer &raquo;
                        </a>
                    </div>
                    <div class="clearboth"></div>
                    <div class="close">
                        <span class="icon-cancel"></span>
                    </div>
                </div>
                <span class="icon-down-dir"></span>
            </div>'
 }
 */

module.exports = function( server ) {

    server.get(baseRoute + "/getnew", function (req, res, next) {

        // Define an array that should contain parsed markers
        var markersJSON;

        // Scrape the url
        //scraperObj.getFileAsHtml("temp-data/sverigeforaren.se.html")
        scraperObj.getAsHtml(urlToScrape)
            .then(function (doc) {

                // Get markers raw data in script tag
                var markerRawData = doc('script:contains(",marker: {")').text();
                //var markerRawData = doc('script:contains(", marker: {")').text();

                // Decode UTF8
                //markerRawData = iconv.decode(markerRawData, "utf8");

                // Remove whitespace and linebreaks
                markerRawData = markerRawData.replace(/(\r\n|\n|\r|\s\s+)/gm," ");

                // Get start and end positions for marker data
                var jsonStart = markerRawData.indexOf("[");
                var jsonEnd = markerRawData.lastIndexOf("]") + 1;

                // Get marker raw data
                markerRawData = markerRawData.substring(jsonStart, jsonEnd);

                // Parse dirty embedded javascript code to JSON
                markersJSON = scraperObj.parseNonStrictJson('{ "myStuff": ' + markerRawData + '}');

                // return JSON output
                res.json({ data: markersJSON}, {'content-type': 'application/json; charset=utf-8'});

                return next();

            })

            .catch(function (error) {

                console.log(error);

                res.send("Something went wrong.");
                return next();

            });

    });
};

