'use strict';

(function () {

    angular.module('Climbspotter.map',

        // Dependencies
        []
        )

        // Controller
        .controller('MapCtrl', ["$scope", "$rootScope", "$cordovaNetwork", "$state", "$q", "mapHelper", "Markers", "$ionicLoading", "$timeout", function ($scope, $rootScope, $cordovaNetwork, $state, $q, mapHelper, Markers, $ionicLoading, $timeout) {

        /* Init vars */
            var timeToWaitBeforeGpsInitialization = 3000; // 3 seconds

            $scope.activeMarker = {};
            $scope.isPopupVisible = false;
            $rootScope.isOfflineIndicatorVisible = false;
            $rootScope.isPirateModeIndicatorVisible = false;

        /* Private methods START */

            var setLoading = function(status){
                if (status){

                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                }
                else {
                    $ionicLoading.hide();
                }
            };

            var showPopup = function(popupObj){
                $scope.isPopupVisible = true;
                $scope.popupTitle = popupObj.title || "";
                $scope.popupBody = popupObj.body || "";
            };

            var setOffline = function(status){
                $rootScope.isOfflineIndicatorVisible = status;

                console.log("mapCtrl::setOffline: status", status);

                if(status){
                    mapHelper.removeMarkerBoundsCircle();
                }
                else {
                    mapHelper.addMarkerBoundsCircle();
                }
            };

            var isOnline = function() {

                return $cordovaNetwork.isOnline() || $cordovaNetwork.getNetwork() === "unknown";
            };


        /* Private Methods END */

        /* Public Methods START */

            $scope.hidePopup = function(){
                $scope.isPopupVisible = false;
            };

            $scope.doSearch = function(){

                // Get new markers
                mapHelper.getCenter()

                    // Got center coordinates
                    .then(function(latLongObj){

                        // App is busy
                        setLoading(true);

                        Markers.getAllMarkersNear(latLongObj, mapHelper.mapMarkerBoundsRadiusInKm)
                            .then(function(){

                                // App is not busy any more
                                setLoading(false);
                            })
                            // Could not get all markers from sources
                            .catch(function(errorMsg){

                                // App is not busy any more
                                setLoading(false);

                                // Show popup
                                showPopup({
                                    title: errorMsg
                                });

                                console.log("mapCtrl::getAllMarkersNear failed: ", errorMsg);
                            })
                    });

            };

        /* Public Methods END */

        /* Initialization START */

            mapHelper.loadGoogleMaps()
                .then(function(){

                    // Track position User phone GPS, after init animation potentially has finished.
                    console.log("mapCtrl::called mapHelper::startTrackingUserPosition()");

                    // We have to give the device time to initiate the GPS, or we will get permission denied.
                    // As for now there is not any way for us to check this. So all we can do is wait a little.
                    $timeout(function(){

                            // Try two times before giving up
                            mapHelper.startTrackingUserPosition()
                                .catch(function(){

                                    $timeout(function() {

                                        mapHelper.startTrackingUserPosition()
                                            .catch(function(errorMsg){

                                                // Show popup
                                                showPopup({
                                                    title: errorMsg
                                                });
                                            })

                                        }, timeToWaitBeforeGpsInitialization
                                    );

                                })
                        }, timeToWaitBeforeGpsInitialization
                    );

                });

        /* Initialization END */

        /* Watchers START */

            // Watch if we go offline.
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){

                if($cordovaNetwork.getNetwork() !== "unknown"){
                    setOffline(true);
                }
            });

            // Watch if we go online.
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){

                // Check that we are truly online, and that forced offline mode is not on.
                if(isOnline() && !$rootScope.isForcedOfflineMode){
                    setOffline(false);
                }
            });

            // Watch isForcedOfflineMode setting
            $rootScope.$on('isForcedOfflineMode:updated', function(event) {

                // Force offline mode is on, show offline indicator
                if($rootScope.isForcedOfflineMode){

                    setOffline(true);
                }
                // Force offline mode is off, hide offline indicator if we are online
                else if(isOnline()){

                    setOffline(false);
                }
            });

            // Watch isPirateMode setting
            $rootScope.$on('isPirateMode:updated', function(event) {

                // Pirate mode event handler
                $rootScope.isPirateModeIndicatorVisible = mapHelper.isPirateMode;

                mapHelper.clearMap();

                mapHelper.updateUserMarker();

                mapHelper.updateTileOverlay();

                mapHelper.updateMapMarkerBoundsCirclePositionIfNeeded();

            });

            // If some other code sends a popup request
            $rootScope.$on('popupMessage:updated', function(event, message) {

                // If there is a message
                if(message){

                    showPopup({
                        title: message
                    });
                }
            });

        /* Watchers END */

        }]);
})();

