/**
 * Created by jopes on 2016-01-10.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.sftMarkersRepository',

        // Dependencies
        []
        )

        .service('stfMarkersRepository', ["$q", "$http", "$rootScope", "dbBase", "DbMarker", "geocoder", function ($q, $http, $rootScope, dbBase, DbMarker, geocoder) {

            // Init vars
            var that = this;
            var apiUrl = 'https://www.svenskaturistforeningen.se/api/v1/map/?security=&mode=facility&filters%5Bfacility%5D=fjallstation+vandrarhem+fjallstuga+hotell&filters%5Bservice%5D=&filters%5Bactivity%5D=&filters%5Bseason%5D=&filters%5Bregion%5D=&filters%5Bcertification%5D=&filters%5Bholiday%5D=&search_query=&filter_search=false&text_search=false';

            /* Private Methods START */

            /* Private Methods END */

            /* Public Methods START */

            // Example of a JSON response from API
            /*
            {
                "data": {
                    "items": [
                        {
                             "type": "facility",
                             "id": 2288,
                             "title": "STF Abisko Fjällstation",
                             "url": "https://www.svenskaturistforeningen.se/anlaggningar/stf-abisko-fjallstation/",
                             "price": "445",
                             "image_url": "https://lajka.stfturist.se/v1/image/citybreak/4007906",
                             "location_name": "Abisko-Kebnekaisefjällen",
                             "position": {
                                 "latitude": 68.35810562108,
                                 "longitude": 18.783799409866
                             },
                             "category_name": "Fjällstation",
                             "color": "#8c013c",
                             "splash_text": "Boka nu: 30% rabatt"
                        },
                        ...
                    }
                }
            }
            */

            that.getAllNear = function (latLongObj) {

                var deferred, markersToReturnArray = [];

                // Create promise
                deferred = $q.defer();

                // Get geo code area.
                geocoder.getCountyForCoordinates(latLongObj.lat, latLongObj.lng)
                    .then(function(county){

                        // Fetch api result
                        $http.get(apiUrl + "&filters%5Blocation%5D=" + county, {
                                params: {

                                }
                            })

                            // All went good.
                            .success(function (response) {

                                console.log("stfRepo::HTTP Get result: ", response);

                                console.log(response.data.items);

                                response.data.items.forEach(function (marker) {

                                    // Parse date variables
                                    //marker.obj.date = parseDate(marker.obj.date);

                                    markersToReturnArray.push(
                                        new DbMarker(
                                            0,
                                            marker.id, // Becomes "eid" property
                                            marker.position.latitude, // lat
                                            marker.position.longitude, // lng
                                            marker.title,
                                            marker.url,
                                            "Svenska Turistföreningen",
                                            new Date(),
                                            0,
                                            "accommodation"
                                        )
                                    );

                                });

                                // Return parsed array
                                deferred.resolve(markersToReturnArray);
                            })

                            // In case data cannot be fetched
                            .error(function () {

                                deferred.reject();
                            });

                    })
                    .catch(function(){
                        deferred.reject("Could not get County for coordinates.");
                    });

                // Return promise
                return deferred.promise;

            };

            /* Public Methods END */

            /* Initialization START */


            /* Initialization END */

        }]);
})();

