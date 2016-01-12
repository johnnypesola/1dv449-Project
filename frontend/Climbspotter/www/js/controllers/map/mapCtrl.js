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

        /* Private Methods END */

        /* Public Methods START */

            $scope.doSearch = function(){

                // Get new markers
                mapHelper.getCenter()

                    // Got center coordinates
                    .then(function(latLongObj){

                        Markers.getAllMarkersNear(latLongObj, mapHelper.mapMarkerBoundsRadiusInKm);
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

