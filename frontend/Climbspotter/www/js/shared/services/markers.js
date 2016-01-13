/**
 * Created by jopes on 2016-01-09.
 */
(function () {

    // Declare module
    angular.module('Climbspotter.markersService',

        // Dependencies
        []
        )

        .service('Markers', ["$q", "$rootScope", "$injector", "mapHelper", function ($q, $rootScope, $injector, mapHelper) {

            /* Init vars */
            var that = this;
            var refreshInterval;

            that.isBusy = false;
            that.markerObjArray = [];

            // Declare services
            var markerServicesArray = [
                {
                    name: "8a",
                    initName: "8aMarkersRepo",
                    enabled: true,
                    reference: {}
                },
                {
                    name: "Sverigeföraren",
                    initName: "sverigeforarenMarkersRepo",
                    enabled: true,
                    reference: {}
                }
            ];

            /* Private methods START */

            var addMarkersToMap = function() {

                // If there are marker in array
                if(that.markerObjArray.length > 0){

                    // Add fetched marker objects as visible objects in google maps instance
                    mapHelper.addMarkersToMap(that.markerObjArray);

                    /*
                    that.markerObjArray.forEach(function(dbMarkerObj){

                        mapHelper.addMarkerToMap(dbMarkerObj);
                    });
                    */
                }
            };

            var injectEnabledServices = function () {

                that.getEnabledServices().forEach(function (service) {

                    // Inject and store reference.
                    service.reference = $injector.get(service.initName);
                })
            };

            var fetchAllServiceMarkersNear = function (latLongObj, distance) {

                var loopPromisesArray = [],
                    servicesArray;

                // Clear old markerdata
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

                            console.log("GET ALL NEAR LOOP ERROR");

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

                fetchAllServiceMarkersNear(latLongObj, distance)
                    .then(function () {

                        // Add markers to map
                        addMarkersToMap();

                        // Resolve promise
                        deferred.resolve(that.markerObjArray);
                    })
                    .catch(function(errorMsg){

                        console.log("fetchAllServiceMarkersNear FAILED");

                        deferred.reject(errorMsg);
                    });

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
