'use strict';

(function () {

    angular.module('Climbspotter.map',

        // Dependencies
        []
        )

        // Controller
        .controller('MapCtrl', ["$scope", "$state", "$q", "mapHelper", "Markers", "$ionicLoading", "$ionicPopup", function ($scope, $state, $q, mapHelper, Markers, $ionicLoading, $ionicPopup) {

        /* Init vars */
            var controllerStateName = "tab.map";
            var markerObjArray = [];

            $scope.activeMarker = {};
            $scope.isPopupVisible = false;

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

                                console.log("getAllMarkersNear FAILED: mapCtrl");
                            })
                    });

            };

        /* Public Methods END */

        /* Initialization START */

            mapHelper.loadGoogleMaps()
                .then(function () {

                    //Markers.startRefreshInterval(10000);


                    // Get all markers on drag end event.
                    /*
                    mapHelper.addMapDragEndEventListener(function(){

                        // Get new markers
                        mapHelper.getCenter()

                            // Got center cordinates
                            .then(function(latLongObj){

                                Markers.getAllMarkersNear(latLongObj);
                            });

                    });
                    */

                    // User phone GPS to track position
                    mapHelper.startTrackingUserPosition();

                });

            // Every time this view is entered, do some stuff.
            $scope.$on("$ionicView.enter", function (scopes, states) {

            });

            // Every time this view is left, do some stuff.
            $scope.$on("$ionicView.leave", function (scopes, states) {

            });

        /* Initialization END */

        }]);
})();

