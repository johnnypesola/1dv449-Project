/**
 * Created by jopes on 2016-01-10.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.geocoderService',

        // Dependencies
        []
        )

        .service('geocoder', ["$q", "$http", function ($q, $http) {

            // Init vars
            var that = this;

            var apiKey = "AIzaSyDNNKBnpsHLUYTdxQWzbtLQHabEKvhrYFE";

            var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json";

            /* Private Methods START */


            var replaceCountyName = function(countyName){

                countyName = countyName.toLowerCase();

                // This is all wrong.. No time to fix.

                if(countyName == "blekinge län"){
                    return "Blekinge";
                }
                else if(countyName == "dalarnas län"){
                    return "Dalarna";
                }
                else if(countyName == "gotlands län"){
                    return "Gotland";
                }
                else if(countyName == "gävleborgs län"){
                    return "Gävleborg";
                }
                else if(countyName == "hallands län"){
                    return "Halland";
                }
                else if(countyName == "jämtlands län"){
                    return "Jämtland";
                }
                else if(countyName == "jönköpings län"){
                    return "Jönköping";
                }
                else if(countyName == "kalmar län"){
                    return "Småland";
                }
                else if(countyName == "kronobergs län"){
                    return "Kronoberg";
                }
                else if(countyName == "norrbottens län"){
                    return "Lappland";
                }
                else if(countyName == "skåne län"){
                    return "Skåne";
                }
                else if(countyName == "stockholms län"){
                    return "Stockholm";
                }
                else if(countyName == "södermanlands län"){
                    return "Södermanland";
                }
                else if(countyName == "uppsala län"){
                    return "Uppsala";
                }
                else if(countyName == "värmlands län"){
                    return "Värmland";
                }
                else if(countyName == "västerbottens län"){
                    return "Västerbotten";
                }
                else if(countyName == "västra götalands län"){
                    return "Bohuslän";
                }
                else if(countyName == "västernorrlands län"){
                    return "Medelpad";
                }
                else if(countyName == "västmanlands län"){
                    return "Västmanland";
                }
                else if(countyName == "örebro län"){
                    return "Närke";
                }
                else if(countyName == "östergötlands län"){
                    return "Östergötland";
                }
                else {
                    return countyName;
                }
            };


            /* Private Methods END */

            /* Public Methods START */

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
                                replaceCountyName(
                                    // The county name result nested quite deep in the response
                                    response.results[0]['address_components'][0].long_name
                                )
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

