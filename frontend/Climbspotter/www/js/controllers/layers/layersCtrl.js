'use strict';

(function () {

    angular.module('Climbspotter.layers',

        // Dependencies
        []
        )

        // Controller
        .controller('LayersCtrl', ["$scope", "$state", "Markers", "mapHelper", function ($scope, $state, Markers, mapHelper) {

            /* Init vars */
            $scope.markerServicesArray = [];

            /* Private methods START */

            var getMarkerServices = function () {
                $scope.markerServicesArray = Markers.getServices();
            };

            /* Private Methods END */

            /* Public Methods START */

            /* Public Methods END */

            /* Initialization START */

            getMarkerServices();

            // Every time this view is left, do some stuff.
            $scope.$on("$ionicView.leave", function (scopes, states) {

                Markers.removeMarkersFromDisabledSources();

            });

            /* Initialization END */

        }]);
})();
