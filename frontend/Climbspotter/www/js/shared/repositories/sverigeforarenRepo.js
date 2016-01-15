/**
 * Created by jopes on 2016-01-08.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.sverigeforarenMarkersRepository',

        // Dependencies
        []
    )

        .service('sverigeforarenMarkersRepository', ["$q", "$http", "$rootScope", "dbBase", "DbMarker", function ($q, $http, $rootScope, dbBase, DbMarker) {

            // Init vars
            var that = this;
            var apiUrl = 'http://api.pesola.se:8100/v1.0/markers/all-near';

            // Private methods
            var parseDate = function (dateStr) {
                return new Date(parseInt(dateStr.substr(6)));
            };

            /* Private Methods END */

            /* Public Methods START */

            // Example of a JSON response from API
            /*
             [
                 {
                     "dis": 0,
                     "obj": {
                         "source": "Sverigeföraren",
                         "href": "http://www.sverigeforaren.se/klattring/vikdal/",
                         "name": "Vikdal",
                         "__v": 0,
                         "_id": "567e0599b4c698b52adb35f6",
                         "location": {
                             "coordinates": [
                                 18.151624500000025,
                                 59.3151438
                             ],
                             "type": "Point"
                         },
                         "date": "2015-12-26T03:12:25.283Z"
                     }
                 }
             ...

             ]
             */

            that.getAllNear = function (latLongObj, distance) {

                var deferred, markersToReturnArray = [];

                // Create promise
                deferred = $q.defer();

                // Fetch api result
                $http.get(apiUrl, {
                        params: {
                            lat: latLongObj.lat,
                            lon: latLongObj.lng,
                            dis: distance,
                            src: "Sverigeföraren"
                        }
                    })

                    // All went good.
                    .success(function (response) {

                        response.forEach(function (marker) {

                            // Parse date variables
                            marker.obj.date = parseDate(marker.obj.date);

                            // Push DbMarker object to array
                            markersToReturnArray.push(

                                new DbMarker(
                                    0,
                                    marker.obj._id, // Becomes "eid" property
                                    marker.obj.location.coordinates[1], // lat
                                    marker.obj.location.coordinates[0], // lng
                                    marker.obj.name,
                                    marker.obj.href,
                                    marker.obj.source,
                                    marker.obj.date,
                                    marker.dis,
                                    "climbing"
                                )
                            );
                        });

                        // Return parsed array
                        deferred.resolve(markersToReturnArray);
                    })

                    // In case data cannot be fetched
                    .error(function () {

                        console.log("DID NOT WORK!");

                        deferred.reject("Could not get Sverigeföraren markers");
                    });


                // Return promise
                return deferred.promise;
            };

            /* Public Methods END */

            /* Initialization START */


            /* Initialization END */

        }]);
})();
