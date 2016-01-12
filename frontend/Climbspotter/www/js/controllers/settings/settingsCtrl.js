'use strict';

(function () {

    angular.module('Climbspotter.settings',

        // Dependencies
        []
        )

        // Controller
        .controller('SettingsCtrl', ["$scope", "$state", "mapHelper", "geocoder", function ($scope, $state, mapHelper, geocoder) {

            /* Init vars */
            var controllerStateName = "tab.settings";

            /* Private methods START */

            var getSettings = function () {
                $scope.isTrackingUserPosition = mapHelper.isTrackingUserPosition();
                $scope.isPirateMode = mapHelper.isPirateMode;
            };

            /* Private Methods END */

            /* Public Methods START */

            $scope.toggleTracking = function (isTrackingUserPosition) {

                if (isTrackingUserPosition) {
                    mapHelper.startTrackingUserPosition();
                }
                else {
                    mapHelper.stopTrackingUserPosition();
                }
            };

            $scope.togglePirateMode = function (isPirateMode) {

                mapHelper.isPirateMode = isPirateMode;

                mapHelper.updateUserMarker();

                mapHelper.updateMapStyle();
            };

            /* Public Methods END */

            /* Initialization START */

            getSettings();


            geocoder.getCountyForCoordinates(68.352058,18.81546);


            // Every time this view is entered, do some stuff.
            $scope.$on("$ionicView.enter", function (scopes, states) {

                if (states.fromCache && states.stateName == controllerStateName) {

                    // Get settings
                    getSettings();
                }
            });

            /* Initialization END */

        }]);
})();
