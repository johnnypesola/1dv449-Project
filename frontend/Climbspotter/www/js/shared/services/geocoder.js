/**
 * Created by jopes on 2016-01-10.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.geocoderService',

        // Dependencies
        ['ngMap']
        )

        .service('geocoder', ["$q", "$http", function ($q, $http) {

            // Init vars
            var that = this;

            var apiKey = "AIzaSyDNNKBnpsHLUYTdxQWzbtLQHabEKvhrYFE";

            var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json";

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

            that.getCountyForCoordinates = function (lat, lng) {

                var deferred;

                // Create promise
                deferred = $q.defer();

                // Fetch api result
                $http.get(apiUrl, {
                        params: {
                            latlng: lat + "," + lng,
                            key: apiKey,
                            result_type: "administrative_area_level_1"
                        }
                    })

                    // All went good.
                    .success(function (response) {

                        if(response.status == "OK"){
                            // Return parsed array
                            deferred.resolve(

                                // The county name result nested quite deep in the response
                                response.results[0]['address_components'][0].long_name
                            );
                        }
                        else {
                            deferred.reject();
                        }
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

