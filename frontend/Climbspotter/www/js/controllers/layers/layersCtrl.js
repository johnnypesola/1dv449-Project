'use strict';

(function () {

    angular.module('Climbspotter.layers',

        // Dependencies
        []
        )

        // Controller
        .controller('LayersCtrl', ["$scope", "$state", "Markers", function ($scope, $state, Markers) {

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

            /* Initialization END */

        }]);
})();
