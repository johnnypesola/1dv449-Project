/**
 * Created by jopes on 2016-01-09.
 */
(function () {

    // Declare module
    angular.module('Climbspotter.markersService',

        // Dependencies
        []
    )

    .service('Markers', ["$q", "$rootScope", "$injector", "$cordovaNetwork", "mapHelper", "dbBase", function ($q, $rootScope, $injector, $cordovaNetwork, mapHelper, dbBase) {

            /* Init vars */
            var that = this;
            var refreshInterval;

            that.isBusy = false;
            that.markerObjArray = [];

            // Declare services
            var markerServicesArray = [
                {
                    name: "8a",
                    initName: "8aMarkersRepository",
                    enabled: true,
                    reference: {},
                    type: "climbing"
                },
                {
                    name: "Sverigeföraren",
                    initName: "sverigeforarenMarkersRepository",
                    enabled: true,
                    reference: {},
                    type: "climbing"
                },
                {
                    name: "Svenska Turistföreningen",
                    initName: "stfMarkersRepository",
                    enabled: true,
                    reference: {},
                    type: "accommodation"
                }
            ];

            /* Private methods START */

            var isOnline = function() {

                return $cordovaNetwork.isOnline() || $cordovaNetwork.getNetwork() === "unknown";
            };

            var addKmToDegree = function(orgLng, orgLat, km, isLng) {

                var deg;

                if(isLng) {
                    deg = orgLng + km / 111.320 * Math.cos(orgLat);
                }
                else {
                    deg = orgLat + km / 110.54;
                }

                return deg;
            };

            var getBoxCoordinatesForDistance = function(distance, orgLng, orgLat) {

                var startLat, endLat, startLng, endLng;

                startLat = addKmToDegree(orgLng, orgLat, -distance);
                endLat = addKmToDegree(orgLng, orgLat, distance);

                startLng = addKmToDegree(orgLng, orgLat, distance, true);
                endLng = addKmToDegree(orgLng, orgLat, -distance, true);

                return {
                    startLat: startLat,
                    endLat: endLat,
                    startLng: startLng,
                    endLng: endLng
                }
            };

            var addMarkersToMap = function() {


                // If there are markers in array
                if(that.markerObjArray.length > 0){

                    // Add fetched marker objects as visible objects in google maps instance
                    mapHelper.addMarkersToMap(that.markerObjArray);
                }
            };

            var addMarkersToDb = function() {

                dbBase.insertMany("marker", ["eid", "lat", "lng", "name", "href", "source", "date", "type"], that.markerObjArray);

            };

            var selectClosestMarkersFromDb = function(servicesArray, lat, lng, count, distance) {

                var deferred, boxCoords, sourcesArray = [], valuesArray = [], whereQuery = "";

                // Create promise
                deferred = $q.defer();

                // No service data to get. Resolve promise
                if(servicesArray.length === 0){
                    deferred.resolve([]);
                }

                // Get source names and remove potentially harmful chars.
                servicesArray.forEach(function(service){
                    sourcesArray.push(service.name.replace(/[^a-z0-9åäöÅÄÖéè,\s\|]/gmi, ""));
                });

                // Check arguments, prevent sql injection
                if(
                    validate.isNumber(+lat) &&
                    validate.isNumber(+lng) &&
                    validate.isNumber(+count) &&
                    validate.isNumber(+distance)
                )
                {

                    /* TODO: Add box coordinates to query. Need to be visually repsesented on map, and needs better algorithm

                     boxCoords = getBoxCoordinatesForDistance(distance, lng, lat);

                    dbBase.querySelect("SELECT * FROM marker WHERE " +
                        "lat > ? AND " +
                        "lat < ? AND " +
                        "lng > ? AND " +
                        "lng < ? " +
                        "ORDER BY ABS(? - lat) + ABS(? - lng) ASC LIMIT ?",
                        [
                            boxCoords.startLat,
                            boxCoords.endLat,
                            boxCoords.startLng,
                            boxCoords.endLng,
                            lat,
                            lng,
                            count
                        ]
                     */

                    // Build non harmful query strings of service sources
                    sourcesArray.forEach(function(sourceName, index){

                        // Build where query string, no user input goes into the where query.
                        whereQuery += "source = ? " + (index+1 !== sourcesArray.length ? " OR " : "");

                        // Push potential dangerous user input value into array
                        valuesArray.push(sourceName);
                    });

                    // Push other values in the array in the correct order.
                    valuesArray.push(+lat, +lng, +count);

                    dbBase.querySelect("SELECT * FROM marker WHERE " +
                        whereQuery +
                        " ORDER BY ABS(? - lat) + ABS(? - lng) ASC LIMIT ?",
                        valuesArray
                    )
                        .then(function(result){

                            deferred.resolve(result);
                        })
                        .catch(function(error){

                            deferred.reject(error);
                        })


                }
                // Arguments are not ok.
                else {
                    console.log("markers::selectClosestMarkersFromDb: Invalid arguments", lat, lng, count, distance);
                    deferred.reject("markers::selectClosestMarkersFromDb: Invalid arguments");
                }

                // Return promise
                return deferred.promise;

            };

            var injectEnabledServices = function () {

                that.getEnabledServices().forEach(function (service) {

                    // Inject and store reference.
                    service.reference = $injector.get(service.initName);
                })
            };

            var fetchAllLocalMarkersNear = function(latLongObj, count, distance) {

                var deferred, servicesArray;

                // Create promise
                deferred = $q.defer();

                // Get all markers from enabled services. And concatenate into one array.
                servicesArray = that.getEnabledServices();

                selectClosestMarkersFromDb(servicesArray, latLongObj.lat, latLongObj.lng, +count, distance)
                    .then(function(result){

                        that.markerObjArray = result;

                        deferred.resolve();

                    })
                    .catch(function(error){

                        console.log("markers::fetchAllLocalMarkersNear: Could not get local markers", error);

                        deferred.reject(error);
                    });

                // Return promise
                return deferred.promise;
            };

            var fetchAllServiceMarkersNear = function (latLongObj, distance) {

                var loopPromisesArray = [],
                    servicesArray;

                // Clear old marker data
                that.markerObjArray = [];

                // Get all markers from enabled services. And concatenate into one array.
                servicesArray = that.getEnabledServices();

                servicesArray.forEach(function (service) {
                    var loopDeferred = $q.defer();

                    service.reference.getAllNear(latLongObj, distance)
                        .then(function (markersArray) {

                            that.markerObjArray = that.markerObjArray.concat(markersArray);

                            // Resolve iterational promise
                            loopDeferred.resolve();
                        })
                        .catch(function(errorMsg){

                            console.log("markers::fetchAllServiceMarkersNear failed");

                            // Error occured
                            loopDeferred.reject(errorMsg);
                        });

                    // Store this iteration promise
                    loopPromisesArray.push(loopDeferred.promise);
                });

                // Return promises
                return $q.all(loopPromisesArray)
            };

            /* Private Methods END */

            /* Public Methods START */

            that.removeMarkersFromDisabledSources = function(){

                markerServicesArray.forEach(function(markerService){

                    if(!markerService.enabled){

                        mapHelper.removeMarkerSource(markerService.name);
                    }
                })
            };

            that.getEnabledServices = function () {

                var returnServiceArray = [];

                markerServicesArray.forEach(function (service) {
                    if (service.enabled == true) {
                        returnServiceArray.push(service);
                    }
                });

                return returnServiceArray;
            };

            that.getServices = function () {
                return markerServicesArray;
            };

            that.getServiceType = function(serviceName){

                var serviceInQuestion;

                serviceInQuestion = markerServicesArray.find(function (service) {
                    return service.name == serviceName;
                });

                return serviceInQuestion.type;
            };

            that.disableService = function (serviceName) {

                var serviceToDisable;

                serviceToDisable = markerServicesArray.find(function (service) {
                    return service.name == serviceName;
                });

                // Set state to disabled
                serviceToDisable.enabled = false;
                // Delete reference
                delete serviceToDisable.reference;
            };

            that.enableService = function (serviceName) {

                var serviceToEnable;

                serviceToEnable = markerServicesArray.find(function (service) {
                    return service.name == serviceName;
                });

                // Inject and store reference.
                serviceToEnable.reference = $injector.get(serviceToEnable.initName);

                // Set state to enabled
                serviceToEnable.enabled = true;
            };

            that.getAllMarkersNear = function (latLongObj, distance) {

                // Create promise
                var deferred = $q.defer();

                // Check if we are online and forced offline mode is off.
                if(isOnline() && !$rootScope.isForcedOfflineMode){

                    fetchAllServiceMarkersNear(latLongObj, distance)
                        .then(function () {

                            // Add markers to map
                            addMarkersToMap();

                            // Add markers to DB
                            addMarkersToDb();

                            // Resolve promise
                            deferred.resolve(that.markerObjArray);
                        })
                        .catch(function(errorMsg){

                            console.log("markers::fetchAllServiceMarkersNear FAILED");

                            deferred.reject(errorMsg);
                        });
                }
                // We are offline or in forced offline mode
                else {

                    fetchAllLocalMarkersNear(latLongObj, +mapHelper.mapMarkerLimit, distance)
                        .then(function(){

                            // Clear markers from map, have are almost guaranteed to have got the limited amount of markers.
                            mapHelper.clearMap();

                            // Add markers to map
                            addMarkersToMap();

                            // Resolve promise
                            deferred.resolve(that.markerObjArray);
                        })
                        .catch(function(errorMsg){

                            console.log("markers::fetchAllLocalMarkersNear FAILED");

                            deferred.reject(errorMsg);
                        });
                }

                // Return promise
                return deferred.promise;
            };


            that.startRefreshInterval = function(intervalTimeMs){

                // Define function that should run in itervals
                var intervalFunction = function(){

                    mapHelper.getCenter()

                        // Got center cordinates
                        .then(function(latLongObj){

                            that.getAllMarkersNear(latLongObj, mapHelper.mapMarkerBoundsRadiusInKm);
                        });
                };

                // Start interval to get markers
                refreshInterval = setInterval(intervalFunction, intervalTimeMs)
            };

            that.stopRefreshInterval = function(){

                clearInterval(refreshInterval);
            };


            /* Public Methods END */

            /* Initialization START */

            injectEnabledServices();

            /* Initialization END */

        }]);
})();
