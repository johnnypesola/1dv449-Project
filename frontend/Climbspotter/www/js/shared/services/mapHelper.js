/**
 * Created by jopes on 2016-01-08.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.mapHelperService',

        // Dependencies
        []
        )

        /* For google maps plugin specific documentation. See https://github.com/mapsplugin/cordova-plugin-googlemaps/wiki */

        .service('mapHelper', ["$q", "$ionicPlatform", "$cordovaGeolocation", "$rootScope", function ($q, $ionicPlatform, $cordovaGeolocation, $rootScope) {

            /* Init vars */
            var that = this;
            var getGpsPosOptions = {timeout: 10000, enableHighAccuracy: true};
            var userPositionWatch;
            var userMarker;
            var isTrackingUserPosition = false;
            var mapTileOverlay;
            var mapMarkerBoundsCircle = {};


            // Keep track of google map Markers, these are the actual ones visible on the map.
            var googleMapMarkers = [];

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

            // Map presentation options
            var mapOptions = {
                compass: true,
                myLocationButton: true,
                indoorPicker: true,
                zoom: true
            };

            // Service properties
            that.userPosition = {coords: {latitude: 0, longitude: 0}};
            that.map = {};
            that.defaultZoom = 12;
            that.animationDuration = 2000; // 2 seconds;
            that.defaultMapType = "TERRAIN";
            that.isPirateMode = false;
            that.mapMarkerLimit = 300;
            that.mapMarkerBoundsRadiusInKm = 100; // Kilometers
            that.shouldUpdateMapMarkerBoundsCirclePosition = true;

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

                // Add click/touch event on marker
                mapMarker.addEventListener(that.google.maps.event.MARKER_CLICK, function() {

                    // Show info window
                    mapMarker.showInfoWindow();
                });

                // Add click/touch event on info window
                mapMarker.addEventListener(that.google.maps.event.INFO_CLICK, function() {

                    window.open(dbMarkerObj.href);
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

                    // Store marker origin
                    mapMarker.source = dbMarkerObj.source;

                    // Resolve marker creation
                    deferred.resolve(mapMarker);
                });

                // Return promise
                return deferred.promise;
            };

            var updateMapMarkerBoundsCirclePosition = function(){

                var center, centerLatLng;

                // Create get camera center position
                that.getCenter()
                    .then(function(center){

                        // Create LatLng
                        centerLatLng = new that.google.maps.LatLng(center.lat, center.lng);

                        // Set position
                        mapMarkerBoundsCircle.setCenter(centerLatLng);

                    });
            };

            var getApproxDistanceBetweenCoords = function ( coords1, coords2 ) {

                // Not the most accurate method, but it does not have to be.

                return Math.sqrt(
                    Math.pow( coords2.lng - coords1.lng, 2 ) +
                    Math.pow( coords2.lat - coords1.lat, 2 )
                );
            };

            var sortMarkersArrayByProximity = function ( refCoords, coordsArray ) {

                var returnArray;

                // Sort coordsArray after being closest to refCoords (closest will have lowest indexes)
                returnArray = coordsArray.sort(function ( a, b ) {

                    return ~~(getApproxDistanceBetweenCoords( refCoords, a ) - getApproxDistanceBetweenCoords( refCoords, b ));
                });

                return returnArray;
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

                        // Update reference
                        userMarker = marker;
                    });
                }
                // Update position
                else {
                    userMarker.position = latLng;

                    // Update icon
                    userMarker.setIcon(icon);
                }
            };

            that.updateTileOverlay = function () {

                var style;

                // Pirate mode! check
                if(that.isPirateMode){

                    // Set to maptype to roadmap, othervise it will be slow
                    that.setMapType("ROADMAP");

                    that.addTileOverlay("http://tile.stamen.com/watercolor/<zoom>/<x>/<y>.jpg");
                }
                else if(!that.isPirateMode) {

                    that.removeTileOverlay();
                }
            };

            that.loadGoogleMaps = function () {

                var deferred;

                // Create promise
                deferred = $q.defer();

                // Wait until the device is ready and maps is available.
                $ionicPlatform.ready(function () {

                    var mapCanvasElement = document.getElementById("map_canvas");

                    // Store references to map object and google plugin
                    that.map = window.plugin.google.maps.Map.getMap(mapCanvasElement);
                    that.google = window.plugin.google;

                    // Set Map options
                    that.map.setOptions(mapOptions);

                    // When google maps is ready
                    that.map.addEventListener(that.google.maps.event.MAP_READY, function () {

                        // Update user position
                        that.updateUserPosition()

                            // All went good
                            .then(function () {

                                // Move camera to user location
                                that.animateCameraTo(that.userPosition.coords.latitude, that.userPosition.coords.longitude)
                                    .then(function(){

                                        // Set default map type
                                        that.setMapType(that.defaultMapType);

                                        // Add marker bounds circle
                                        that.addMarkerBoundsCircle();
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

            that.addTileOverlay = function(tileUrlFormat){

                // There should no be reference
                if(mapTileOverlay == null) {

                    that.map.addTileOverlay({

                        // <x>,<y> and <zoom> are replaced with values
                        tileUrlFormat: tileUrlFormat
                    }, function(tileOverlay) {

                        // Store for future reference
                        mapTileOverlay = tileOverlay;
                    });
                }
            };

            that.removeTileOverlay = function(){

                if(mapTileOverlay !== null){

                    // Remove tile overlay
                    mapTileOverlay.remove();

                    // Set reference to null
                    mapTileOverlay = null;
                }
            };

            that.addMarkersToMap = function(dbMarkersArray){

                var deferred;

                // Create promise
                deferred = $q.defer();

                // Get markers that are closest to the center
                that.getCenter()
                    .then(function(center){

                        // If we have more markers than the limit.
                        if(dbMarkersArray.length > that.mapMarkerLimit){

                            // Sort markers after center coordinates, the closest ones should have smallest index-numbers.
                            dbMarkersArray = sortMarkersArrayByProximity(center, dbMarkersArray);

                            //  Slice it to a size that is equal to the limit
                            dbMarkersArray = dbMarkersArray.slice(0, (+that.mapMarkerLimit));
                        }

                        // Loop though potential map markers
                        dbMarkersArray.forEach(function(dbMarker){
                            that.addMarkerToMap(dbMarker);
                        });
                    });

                // Return promise
                return deferred.promise;

            };

            that.addMarkerToMap = function (dbMarkerObj) {

                var deferred;

                // Create promise
                deferred = $q.defer();

                // Check that marker does not exist
                if(!googleMapMarkers.some(function(mapMarker){

                        return (
                            mapMarker.dbId == dbMarkerObj.id
                        )
                    })
                ){

                    console.log("Marker does not exist... Creating ", dbMarkerObj.id);

                    // Create marker on map
                    createMapMarker(dbMarkerObj, "climbing")

                        // Marker created
                        .then(function(mapMarker){

                            // Create mousedown event for marker
                            addMarkerTouchEvent(mapMarker, dbMarkerObj);

                            // Push marker to array.
                            googleMapMarkers.push(mapMarker);

                            // Check if markersArray is full, remove the first entry
                            if(googleMapMarkers.length > that.mapMarkerLimit){
                                googleMapMarkers[0].remove();
                                googleMapMarkers.shift();
                            }

                            // Update root marker count
                            $rootScope.markerCount = googleMapMarkers.count;

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

            that.clearMap = function() {

                // Clear map events
                that.map.off();

                googleMapMarkers.forEach(function(mapMarker){
                    mapMarker.remove();
                });

                // Reset container array
                googleMapMarkers = [];
            };

            that.removeMarkerSource = function(sourceName){

                googleMapMarkers.forEach(function(mapMarker, index){

                    if(mapMarker.source == sourceName){

                        // Remove marker from map
                        mapMarker.remove();
                    }
                });

                // Remove markers from mapMarkers array
                googleMapMarkers = googleMapMarkers.filter(function(mapMarker){
                    return mapMarker.source !== sourceName;
                });
            };

            that.updateUserPosition = function() {

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

            that.addMapDragEndEventListener = function(callBack){


                //that.google.maps.event.addListener(that.map, 'dragend', callBack);
                that.map.addEventListener(that.google.maps.event.CAMERA_CHANGE, callBack)
            };

            that.addMarkerBoundsCircle = function(){

                var radius, centerLatLng;

                radius = that.mapMarkerBoundsRadiusInKm * 1000; // * Times 1000 meters

                that.getCenter()
                    .then(function(center){

                        centerLatLng = new that.google.maps.LatLng(center.lat, center.lng);

                        that.map.addCircle({
                            'center': centerLatLng,
                            'radius': radius,
                            'strokeColor' : '#81cff4',
                            'fillColor' : '#FFF0',
                            'strokeWidth': 3
                        }, function(circle) {

                            // Store reference
                            mapMarkerBoundsCircle = circle;

                            that.updateMapMarkerBoundsCirclePositionIfNeeded();
                        });

                    });
            };

            that.updateMapMarkerBoundsCirclePositionIfNeeded = function(){

                // Update circle position on camera change
                that.map.on(that.google.maps.event.CAMERA_CHANGE, function(){

                    if(that.shouldUpdateMapMarkerBoundsCirclePosition){
                        updateMapMarkerBoundsCirclePosition();
                    }
                });
            };

            that.removeMarkerBoundsCircle = function() {

                mapMarkerBoundsCircle.remove();
            };

            /* Public Methods END */

            /* Initialization START */

            // Watch mapMarkerLimit setting

            $rootScope.$on('mapMarkerLimit:updated', function(event) {

                var i, howManyToRemove;

                // If we have too many makers now.
                if(googleMapMarkers.length > that.mapMarkerLimit){

                    howManyToRemove = googleMapMarkers.length - that.mapMarkerLimit;

                    // Remove markers oldest markers from map
                    for(i = 0; i < howManyToRemove; i++){
                        googleMapMarkers[i].remove();
                    }

                    // Remove the oldest from array
                    googleMapMarkers.splice(0, howManyToRemove);
                }
            });

            // Watch mapMarkerBoundsRadiusInKm setting
            $rootScope.$on('mapMarkerBoundsRadiusInKm:updated', function(event) {

                mapMarkerBoundsCircle.setRadius(that.mapMarkerBoundsRadiusInKm * 1000); // * Times 1000 meters

            });

            /* Initialization END */

        }]);
})();
