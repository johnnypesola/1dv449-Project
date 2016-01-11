'use strict';

(function () {

    angular.module('Climbspotter.map',

        // Dependencies
        ['ngMap']
        )

        // Controller
        .controller('MapCtrl', ["$scope", "$state", "$q", "mapHelper", "NgMap", "Markers", function ($scope, $state, $q, mapHelper, NgMap, Markers) {

        /* Init vars */
            var controllerStateName = "tab.map";
            var markerObjArray = [];

            $scope.activeMarker = {};

        /* Private methods START */

            var setActiveMaker = function(activeMarkerObj){

                $scope.activeMarker = activeMarkerObj;
            };

        /* Private Methods END */

        /* Public Methods START */

            $scope.showMarkerInfo = function (event, marker) {

                // Set active marker
                $scope.activeMarker = marker;

                // Display info google maps window
                mapHelper.showInfoWindow(marker.obj._id);

            };

            $scope.openActiveMarkerWwwSource = function () {

                window.open($scope.activeMarker.obj.href);
            };

        /* Public Methods END */

        /* Initialization START */
            mapHelper.markerClickCallbackFunc = setActiveMaker;

            mapHelper.loadGoogleMaps()
                .then(function () {

                    Markers.startRefreshInterval(10000);

                    mapHelper.doOnDragEnd(function(){

                        console.log("drag end?");
                        //Markers.getAllMarkersNear(mapHelper.getCenter())

                    });

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

