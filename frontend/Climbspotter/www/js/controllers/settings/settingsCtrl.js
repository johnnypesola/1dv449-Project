'use strict';

(function () {

    angular.module('Climbspotter.settings',

        // Dependencies
        []
        )

        // Controller
        .controller('SettingsCtrl', ["$rootScope", "$scope", "$state", "mapHelper", "geocoder", function ($rootScope, $scope, $state, mapHelper, geocoder) {

            /* Init vars */
            var controllerStateName = "tab.settings";

            /* Private methods START */

            var getSettings = function () {
                $scope.isTrackingUserPosition = mapHelper.isTrackingUserPosition();
                $scope.isPirateMode = mapHelper.isPirateMode;
                $scope.mapMarkerLimit = mapHelper.mapMarkerLimit;
                $scope.mapMarkerBoundsRadiusInKm = mapHelper.mapMarkerBoundsRadiusInKm;
                $scope.mapMarkerBoundsRadiusInMiles = kmToMiles($scope.mapMarkerBoundsRadiusInKm);
            };

            /* Private Methods END */

            var kmToMiles = function(km){
                return (km * 0.62137).toFixed(1);
            };

            /* Public Methods START */

            $scope.toggleTracking = function (isTrackingUserPosition) {

                if (isTrackingUserPosition) {
                    mapHelper.startTrackingUserPosition();
                }
                else {
                    mapHelper.stopTrackingUserPosition();
                }
            };

            $scope.toggleForcedOfflineMode = function(isForcedOfflineMode) {

                $rootScope.isForcedOfflineMode = isForcedOfflineMode;

                $rootScope.$broadcast('isForcedOfflineMode:updated', true);
            };

            $scope.togglePirateMode = function (isPirateMode) {

                mapHelper.isPirateMode = isPirateMode;

                $rootScope.$broadcast('isPirateMode:updated', true);

            };

            $scope.calculateMiles = function(){

                $scope.mapMarkerBoundsRadiusInMiles = kmToMiles($scope.mapMarkerBoundsRadiusInKm);
            };

        /* Public Methods END */

        /* Initialization START */

            getSettings();

            //geocoder.getCountyForCoordinates(68.352058,18.81546);

            // Every time this view is entered, do some stuff.
            $scope.$on("$ionicView.enter", function (scopes, states) {



            });

            // Watch when settings changes in view, and update them
            $scope.$watch('mapMarkerLimit', function(newValue) {

                mapHelper.mapMarkerLimit = newValue;

            });

            $scope.$watch('mapMarkerBoundsRadiusInKm', function(newValue) {

                mapHelper.mapMarkerBoundsRadiusInKm = newValue;

            });

            // Every time this view is left, do some stuff.
            $scope.$on("$ionicView.leave", function (scopes, states) {

                $rootScope.$broadcast('mapMarkerLimit:updated', true);

                $rootScope.$broadcast('mapMarkerBoundsRadiusInKm:updated', true);

            });



        }]);
})();
