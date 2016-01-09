/**
 * Created by jopes on 2016-01-08.
 */
(function() {
    // Declare module
    angular.module('Climbspotter.mapHelperService',

        // Dependencies
        []
        )

        .service('mapHelper', ["$q", "$cordovaGeolocation", function ($q, $cordovaGeolocation) {

          // Init vars
            var that = this;
            var getGpsPosOptions = {timeout: 10000, enableHighAccuracy: true};

          // Service properties
            that.userPosition = {coords : { latitude: 0, longitude: 0 }};
            that.map = {};

          // Service methods
            that.loadGoogleMaps = function() {

                var deferred, latLng, mapOptions;

                // Create promise
                deferred = $q.defer();

                    that.updateUserPosition()
                        // All went good
                        .then(function(){

                            // Create maps specific coordinate object
                            latLng = new google.maps.LatLng(that.userPosition.coords.latitude, that.userPosition.coords.longitude);

                            mapOptions = {
                                center: latLng,
                                zoom: 15,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };

                            that.map = new google.maps.Map(document.getElementById("map"), mapOptions);

                            // Resolve promise
                            deferred.resolve();
                        })
                        // An error occured
                        .catch(function(msg){

                          deferred.reject(msg)
                      });

                  // Return promise
                  return deferred.promise;
            };

            that.addMarkerToMap = function(lat, lng){
                var marker, latLng, deferred;

                // Create promise
                deferred = $q.defer();

                // When google maps is idle
                google.maps.event.addListenerOnce(that.map, 'idle', function(){

                    // Create google LatLng obj
                    latLng = new google.maps.LatLng(lat, lng);

                    // Create marker on map
                    marker = new google.maps.Marker({
                      map: that.map,
                      position: latLng
                    });

                    // Resolve with marker object.
                    deferred.resolve(marker);
                });

                // Return promise
                return deferred.promise;
            };

            that.updateUserPosition = function(){

                var deferred;

                // Create promise
                deferred = $q.defer();

                $cordovaGeolocation.getCurrentPosition(getGpsPosOptions).then(function(position){

                    // Update position
                    that.userPosition = position;

                    // Resolve promise
                    deferred.resolve();
                }, function(error) {

                    // Reject promise
                    deferred.reject("Could not get user position.")
                });

                // Return promise
                return deferred.promise;
            };

            that.addInfoWindow = function(contentStr, markerObj, eventStr) {

                // eventStr can be click, and so on...

                var infoWindow;

                // Create infoWindow
                infoWindow = new google.maps.InfoWindow({
                    content: contentStr
                });

                // Add infoWindow to marker
                google.maps.event.addListener(markerObj, eventStr, function () {
                    infoWindow.open(that.map, markerObj);
                });
            };
        }]);
})();
