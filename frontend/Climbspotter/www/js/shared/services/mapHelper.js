/**
 * Created by jopes on 2016-01-08.
 */
(function () {
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
            var isTrackingUserPosition = false;

            // Keep track of google map Markers, these are the actual ones visible on the map.
            var googleMapMarkers = [];

            // Marker icon image specs
            var markerIcons = {

                user: {
                    url: 'img/user_marker.png',
                    size: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(16, 16)
                },
                user_pirate: {
                    url: 'img/user_marker_pirate.png',
                    size: new google.maps.Size(29, 45),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(15, 45)
                },
                userDisabled: {
                    url: 'img/user_marker_last_loc.png',
                    size: new google.maps.Size(64, 64),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(16, 16)
                },
                userDisabled_pirate: {
                    url: 'img/user_marker_last_loc_pirate.png',
                    size: new google.maps.Size(41, 34),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(20, 18)
                },
                climbing: {
                    url: 'img/marker_climbing.png',
                    size: new google.maps.Size(22, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 32)
                },
                climbing_pirate: {
                    url: 'img/marker_pirate.png',
                    size: new google.maps.Size(32, 24),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(16, 24)
                }
            };

            // Map presentation styles
            var mapStyles = {
                normal: {
                    styles: []
                },
                pirate: {
                    styles: [
                        {
                            stylers: [
                                {hue: "#1900ff"},
                                {invert_lightness: true},
                                {weight: 0.5}
                            ]
                        }
                    ]
                }
            };

            // Service properties
            that.userPosition = {coords: {latitude: 0, longitude: 0}};
            that.map = {};
            that.defaultZoom = 6;
            that.isPirateMode = false;
            that.markerClickCallbackFunc = function(){};

            /* Private methods START */
            var makeIcon = function (iconType) {

                // Pirate mode! check
                if (that.isPirateMode) {
                    iconType += '_pirate';
                }

                return {
                    url: markerIcons[iconType].url,
                    size: markerIcons[iconType].size,
                    origin: markerIcons[iconType].origin,
                    anchor: markerIcons[iconType].anchor
                }
            };

            var addMarkerTouchEvent = function(marker, dbMarkerObj){

                google.maps.event.addListener(marker, 'mousedown', function () {

                    // Show info window
                    that.showInfoWindow(marker);

                    // Execute marker click callback, probably defined in mapCtrl
                    that.markerClickCallbackFunc(dbMarkerObj);
                })
            };

            var createMapMarker = function(dbMarkerObj, typeString){

                var marker = new google.maps.Marker({
                    map: that.map,
                    position: new google.maps.LatLng(dbMarkerObj.lat, dbMarkerObj.lng), // Create google LatLng obj
                    icon: makeIcon(typeString)
                });

                return marker;
            };

            /* Private methods END */

            /* Public Methods START */

            that.getCenter = function(){

                var center = that.map.getCenter();

                return {
                    lat: center.lat(),
                    lng: center.lng()
                };
            };

            that.updateUserMarker = function () {

                var latLng, icon;

                // Create google LatLng obj
                latLng = new google.maps.LatLng(
                    that.userPosition.coords.latitude,
                    that.userPosition.coords.longitude
                );

                // Create icon
                icon = makeIcon(isTrackingUserPosition ? "user" : "userDisabled");

                // Create marker on map if needed
                if (userMarker == null) {

                    // Create marker on map
                    userMarker = new google.maps.Marker({
                        map: that.map,
                        position: latLng,
                        icon: icon
                    });
                }
                // Update position
                else {
                    userMarker.position = latLng;

                    // Update icon
                    userMarker.setIcon(icon);
                }
            };

            that.updateMapStyle = function () {

                var style;

                // Pirate mode! check
                style = that.isPirateMode ? mapStyles.pirate : mapStyles.normal;

                that.map.setOptions(style);
            };

            that.loadGoogleMaps = function () {

                var deferred, latLng, mapOptions;

                // Create promise
                deferred = $q.defer();

                // Load maps

                // Wait until the map is ready status.
                $rootScope.map.addEventListener(plugin.google.maps.event.MAP_READY, function () {

                    //that.map = map;

                    that.updateUserPosition()

                        // All went good
                        .then(function () {

                            // Create maps specific coordinate object
                            latLng = new google.maps.LatLng(that.userPosition.coords.latitude, that.userPosition.coords.longitude);

                            that.map.setCenter(latLng);
                            that.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                            that.map.setZoom(that.defaultZoom);

                            // Resolve promise
                            deferred.resolve();
                        })

                        // An error occured
                        .catch(function (msg) {

                            deferred.reject(msg)
                        });
                });
                */

                // Return promise
                return deferred.promise;
            };

            that.addMarkerToMap = function (dbMarkerObj) {

                var marker, deferred;

                // Create promise
                deferred = $q.defer();

                if(!googleMapMarkers.some(function(existingMarker){

                        var existingMarkerPos = existingMarker.getPosition();

                        return (
                            existingMarkerPos.lat() == dbMarkerObj.lat &&
                            existingMarkerPos.lng() == dbMarkerObj.lng
                        )
                    })
                ){
                    // Create marker on map
                    marker = createMapMarker(dbMarkerObj, "climbing");

                    // Create mousedown event for marker
                    addMarkerTouchEvent(marker, dbMarkerObj);

                    // Push marker to array.
                    googleMapMarkers.push(marker);

                    // Resolve with google marker object.
                    deferred.resolve(marker);
                }
                // Marker already exists on map
                else {
                    deferred.reject();
                }

                // Return promise
                return deferred.promise;
            };

            that.clearMarkers = function (markerObjArray) {

                googleMapMarkers.forEach(function (marker) {

                    marker.setMap(null);

                });

                // Reset container array
                googleMapMarkers = [];
            };

            that.updateUserPosition = function () {

                var deferred;

                // Create promise
                deferred = $q.defer();

                $cordovaGeolocation.getCurrentPosition(getGpsPosOptions).then(function (position) {

                    // Update user position
                    that.userPosition = position;

                    // Resolve promise
                    deferred.resolve();

                    // Update user marker on map
                    that.updateUserMarker();

                }, function (error) {

                    // Reject promise
                    deferred.reject("Could not get user position.")
                });

                // Return promise
                return deferred.promise;
            };

            that.startTrackingUserPosition = function () {

                // Watch options
                var watchOptions = {
                    timeout: 5000,
                    enableHighAccuracy: false // may cause errors if true
                };

                // Start tracking user position
                userPositionWatch = $cordovaGeolocation.watchPosition(watchOptions);
                userPositionWatch.then(
                    null,
                    function (err) {

                    },
                    // It went well
                    function (position) {

                        // Update user position
                        that.userPosition = position;

                        // Set flag
                        isTrackingUserPosition = true;

                        // Update user marker on map
                        that.updateUserMarker();
                    }
                );
            };

            that.stopTrackingUserPosition = function () {

                userPositionWatch.clearWatch();

                isTrackingUserPosition = false;

                that.updateUserMarker();
            };

            that.isTrackingUserPosition = function () {
                return isTrackingUserPosition;
            };

            that.showInfoWindow = function (id) {

                that.map.showInfoWindow('marker-info', id);
            };

            that.doOnDragEnd = function(callBack){


                google.maps.event.addListener(that.map, 'tilesloaded', callBack);

            };

            /* Public Methods END */

        }]);
})();
