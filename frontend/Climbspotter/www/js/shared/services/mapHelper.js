/**
 * Created by jopes on 2016-01-08.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.mapHelperService',

        // Dependencies
        ['ngMap']
        )

        .service('mapHelper', ["$q", "$ionicPlatform", "$cordovaGeolocation", "NgMap", "$rootScope", function ($q, $ionicPlatform, $cordovaGeolocation, NgMap, $rootScope) {

            /* Init vars */
            var that = this;
            var getGpsPosOptions = {timeout: 10000, enableHighAccuracy: true};
            var userPositionWatch;
            var userMarker;
            var isTrackingUserPosition = false;

            // Keep track of google map Markers, these are the actual ones visible on the map.
            var googleMapMarkers = [];

            /* Google maps plugin possible event handlers for map object.
                Apply like this: that.map.addEventListener(that.google.maps.event.EVENT_NAME, callBack)

            CAMERA_CHANGE: "camera_change"
            CAMERA_IDLE: "camera_idle"
            INDOOR_BUILDING_FOCUSED: "indoor_building_focused"
            INDOOR_LEVEL_ACTIVATED: "indoor_level_activated"
            INFO_CLICK: "info_click"
            MAP_CLICK: "click"
            MAP_CLOSE: "map_close"
            MAP_LOADED: "map_loaded"
            MAP_LONG_CLICK: "long_click"
            MAP_READY: "map_ready"
            MAP_WILL_MOVE: "will_move"
            MARKER_CLICK: "click"
            MARKER_DRAG: "drag"
            MARKER_DRAG_END: "drag_end"
            MARKER_DRAG_START: "drag_start"
            MY_LOCATION_BUTTON_CLICK: "my_location_button_click"
            MY_LOCATION_CHANGE: "my_location_change
            */

            // Marker icon image specs
            var markerIcons = {

                user: {
                    url: 'www/img/user_marker.png'
                },
                user_pirate: {
                    url: 'www/img/user_marker_pirate.png'
                },
                userDisabled: {
                    url: 'www/img/user_marker_last_loc.png'
                },
                userDisabled_pirate: {
                    url: 'www/img/user_marker_last_loc_pirate.png'
                },
                climbing: {
                    url: 'www/img/marker_climbing.png'
                },
                climbing_pirate: {
                    url: 'www/img/marker_pirate.png'
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
            that.defaultZoom = 12;
            that.animationDuration = 2000; // 2 seconds;
            that.defaultMapType = "TERRAIN";
            that.isPirateMode = false;
            that.markerClickCallbackFunc = function(){};

            /* Private methods START */
            var makeIcon = function (iconType) {

                // Pirate mode! check
                if (that.isPirateMode) {
                    iconType += '_pirate';
                }

                return {
                    url: markerIcons[iconType].url
                }
            };

            var addMarkerTouchEvent = function(mapMarker, dbMarkerObj){

                // Add click/touch functionality
                mapMarker.addEventListener(that.google.maps.event.MARKER_CLICK, function() {

                    // Show info window
                    mapMarker.showInfoWindow();

                    // Execute marker click callback, probably defined in mapCtrl
                    that.markerClickCallbackFunc(dbMarkerObj);
                });
            };

            var createMapMarker = function(dbMarkerObj, typeString){

                var latLng, deferred;

                // Create promise
                deferred = $q.defer();

                // Create google LatLng obj
                latLng = new that.google.maps.LatLng(dbMarkerObj.lat, dbMarkerObj.lng);

                // Create marker on map
                that.map.addMarker({

                    // Marker specific
                    position: latLng,
                    icon: makeIcon(typeString),
                    // Content specific
                    title: dbMarkerObj.name,
                    snippet: "@" + dbMarkerObj.source

                }, function(mapMarker){

                    // Store database Id in map marker.
                    mapMarker.dbId = dbMarkerObj.id;

                    // Resolve marker creation
                    deferred.resolve(mapMarker);
                });

                // Return promise
                return deferred.promise;
            };

            /* Private methods END */

            /* Public Methods START */

            that.getCenter = function(){

                var deferred;

                // Create promise
                deferred = $q.defer();

                that.map.getCameraPosition(function(camera) {

                    // Resolve promise
                    deferred.resolve(
                        {
                            lat: camera.target.lat,
                            lng: camera.target.lng
                        }
                    )
                });

                // Return promise
                return deferred.promise;
            };

            that.updateUserMarker = function () {

                var latLng, icon;

                // Create google LatLng obj
                latLng = new that.google.maps.LatLng(
                    that.userPosition.coords.latitude,
                    that.userPosition.coords.longitude
                );

                // Create icon
                icon = makeIcon(isTrackingUserPosition ? "user" : "userDisabled");

                // Create marker on map if needed
                if (userMarker == null) {

                    // Create marker on map
                    that.map.addMarker({
                        position: latLng,
                        icon: icon
                    }, function(marker) {

                        console.log("updateUserMarker", marker);

                        // Update reference
                        userMarker = marker;
                    });

                    /*
                    userMarker = new that.google.maps.Marker({
                        map: that.map,
                        position: latLng,
                        icon: icon
                    });
                    */

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

                var deferred;

                // Create promise
                deferred = $q.defer();

                // Load maps

                console.log("loadGoogleMaps");

                // Wait until the device is ready and maps is available.
                $ionicPlatform.ready(function () {

                    console.log("$ionicPlatform.ready");

                    var mapCanvasElement = document.getElementById("map_canvas");

                    // Store references to map object and google plugin
                    that.map = window.plugin.google.maps.Map.getMap(mapCanvasElement);
                    that.google = window.plugin.google;

                    console.log(that.google);

                    // When google maps is ready
                    that.map.addEventListener(that.google.maps.event.MAP_READY, function () {


                        //
                        that.updateUserPosition()

                            // All went good
                            .then(function () {

                                // Move camera to user location
                                that.animateCameraTo(that.userPosition.coords.latitude, that.userPosition.coords.longitude)
                                    .then(function(){
                                        that.setMapType(that.defaultMapType)
                                    });

                                // Resolve promise
                                deferred.resolve();
                            })

                            // An error occured
                            .catch(function (msg) {

                                deferred.reject(msg)
                            });
                    });
                });

                // Return promise
                return deferred.promise;
            };

            that.animateCameraTo = function(lat, lng, duration, zoom) {

                var latLng, deferred;

                // Create promise
                deferred = $q.defer();

                // Optional arguments
                duration = duration || that.animationDuration;
                zoom = zoom || that.defaultZoom;

                // Convert to google LatLng
                latLng = new that.google.maps.LatLng(lat, lng);

                that.map.animateCamera({
                    'target': latLng,
                    'zoom': zoom,
                    'duration': duration
                }, function() {

                    // Resolve promise
                    deferred.resolve();
                });

                // Return promise
                return deferred.promise;
            };

            that.setCenter = function(lat, lng){

                // Create maps specific coordinate object
                var latLng = new that.google.maps.LatLng(lat, lng);

                // Set map center
                that.map.setCenter(latLng);
            };

            that.setMapType = function (typeName) {

                // To uppercase
                typeName = typeName.toUpperCase();

                if(
                    typeName == "TERRAIN" ||
                    typeName == "HYBRID" ||
                    typeName == "SATELLITE" ||
                    typeName == "ROADMAP"
                ){
                    that.map.setMapTypeId(that.google.maps.MapTypeId[typeName]);
                }
            };

            that.addMarkerToMap = function (dbMarkerObj) {

                var marker, deferred;

                // Create promise
                deferred = $q.defer();

                if(!googleMapMarkers.some(function(mapMarker){

                        return (
                            mapMarker.dbId == dbMarkerObj.id
                        )
                    })
                ){

                    console.log("Marker does not exist... Creating ", dbMarkerObj);

                    // Create marker on map
                    createMapMarker(dbMarkerObj, "climbing")

                        // Marker created
                        .then(function(mapMarker){

                            // Create mousedown event for marker
                            addMarkerTouchEvent(mapMarker, dbMarkerObj);

                            // Push marker to array.
                            googleMapMarkers.push(mapMarker);

                            // Resolve with google marker object.
                            deferred.resolve(mapMarker);
                        });
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

                        console.log("Error tracking position");
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

            that.doOnDragEnd = function(callBack){


                //that.google.maps.event.addListener(that.map, 'dragend', callBack);
                that.map.addEventListener(that.google.maps.event.CAMERA_IDLE, callBack)
            };

            /* Public Methods END */

        }]);
})();
