/**
 * Created by jopes on 2016-01-08.
 */
(function() {
    // Declare module
    angular.module('Climbspotter.mapHelperService',

        // Dependencies
        ['ngMap']
        )

        .service('mapHelper', ["$q", "$cordovaGeolocation", "NgMap", function ($q, $cordovaGeolocation, NgMap) {

          /* Init vars */
            var that = this;
            var getGpsPosOptions = {timeout: 10000, enableHighAccuracy: true};
            var userPositionWatch;
            var userMarker;
            var userMarkerImg = "img/user_marker.png";

          // Service properties
            that.userPosition = {coords : { latitude: 0, longitude: 0 }};
            that.map = {};
            that.defaultZoom = 6;

          /* Private methods START */

            var updateUserMarker = function(){

                var latLng, marker;

                // Create google LatLng obj
                latLng = new google.maps.LatLng(
                    that.userPosition.coords.latitude,
                    that.userPosition.coords.longitude
                );

                // Create marker on map if needed
                if(userMarker == null){

                    // Create marker on map
                    userMarker = new google.maps.Marker({
                        map: that.map,
                        position: latLng,
                        icon: userMarkerImg
                    });
                }
                // Update position
                else {
                    userMarker.position = latLng;
                }
            };

          /* Private methods END */

          /* Public Methods START */

            that.loadGoogleMaps = function() {

                var deferred, latLng, mapOptions;

                // Create promise
                deferred = $q.defer();

                // Load maps
                NgMap.getMap().then(function(map){
                    that.map = map;

                    that.updateUserPosition()
                        // All went good
                        .then(function(){

                            // Create maps specific coordinate object
                            latLng = new google.maps.LatLng(that.userPosition.coords.latitude, that.userPosition.coords.longitude);

                            that.map.setCenter(latLng);
                            that.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                            that.map.setZoom(that.defaultZoom);

                            // Resolve promise
                            deferred.resolve();
                        })

                        // An error occured
                        .catch(function(msg){

                            deferred.reject(msg)
                        });
                });

                // Return promise
                return deferred.promise;
            };

            that.addMarkerToMap = function(lat, lng, clickCallBack){
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

                    // Create mousedown event for marker
                    google.maps.event.addListener(marker, 'mousedown', function() {

                        that.showInfoWindow(marker);

                        // Execute callback
                        clickCallBack();
                    });

                    // Resolve with google marker object.
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

                    // Update user position
                    that.userPosition = position;

                    // Resolve promise
                    deferred.resolve();

                    // Update user marker on map
                    updateUserMarker();

                }, function(error) {

                    // Reject promise
                    deferred.reject("Could not get user position.")
                });

                // Return promise
                return deferred.promise;
            };

            that.startTrackingUserPosition = function(){

                // Watch options
                var watchOptions = {
                    timeout : 5000,
                    enableHighAccuracy: false // may cause errors if true
                };

                userPositionWatch = $cordovaGeolocation.watchPosition(watchOptions);
                userPositionWatch.then(
                    null,
                    function(err) {

                    },
                    function(position) {

                        // Update user position
                        that.userPosition = position;

                        // Update user marker on map
                        updateUserMarker();
                    }
                );
            };

            that.stopTrackingUserPosition = function(){
                userPositionWatch.clearWatch();
            };

            that.showInfoWindow = function(id) {

                that.map.showInfoWindow('marker-info', id);
            };

          /* Public Methods END */

        }]);
})();
