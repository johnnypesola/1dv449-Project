/**
 * Created by jopes on 2016-01-10.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.sftMarkersRepository',

        // Dependencies
        []
        )

        .service('stfMarkersRepository', ["$q", "$http", "$rootScope", "dbBase", function ($q, $http, $rootScope, dbBase) {

            // Init vars
            var that = this;
            var apiUrl = 'https://www.svenskaturistforeningen.se/api/v1/map/?security=&mode=facility&filters%5Bfacility%5D=fjallstation+vandrarhem+fjallstuga+hotell&filters%5Bservice%5D=&filters%5Bactivity%5D=&filters%5Bseason%5D=&filters%5Bregion%5D=&filters%5Bcertification%5D=&filters%5Bholiday%5D=&filters%5Blocation%5D=&search_query=&filter_search=false&text_search=false';

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
            */

            that.getAllNear = function (latLongObj) {

                var deferred, markersToReturnArray = [];

                // Create promise
                deferred = $q.defer();

                // Fetch api result
                $http.get(apiUrl, {
                        params: {
                            lat: latLongObj.lat,
                            lon: latLongObj.lng,
                            dis: 100,
                            src: "Sverigeföraren"
                        }
                    })

                    // All went good.
                    .success(function (response) {

                        response.forEach(function (marker) {

                            // Parse date variables
                            marker.obj.date = parseDate(marker.obj.date);

                            markersToReturnArray.push(marker);
                        });

                        // Return parsed array
                        deferred.resolve(markersToReturnArray);
                    })

                    // In case data cannot be fetched
                    .error(function () {

                        deferred.reject();
                    });


                // Return promise
                return deferred.promise;
            };

            /* Public Methods END */

            /* Initialization START */


            /* Initialization END */

        }]);
})();

