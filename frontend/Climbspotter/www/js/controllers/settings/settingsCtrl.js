'use strict';

(function() {

  angular.module('Climbspotter.settings',

    // Dependencies
    []
    )

    // Controller
    .controller('SettingsCtrl', ["$scope", "$state", "mapHelper", function ($scope, $state, mapHelper) {

        /* Init vars */
        var controllerStateName = "tab.settings";

        /* Private methods START */

        var getSettings = function(){
            $scope.isTrackingUserPosition = mapHelper.isTrackingUserPosition();
        };

        /* Private Methods END */

        /* Public Methods START */

        $scope.toggleTracking = function(isTrackingUserPosition){

            if(isTrackingUserPosition){
                mapHelper.startTrackingUserPosition();
            }
            else {
                mapHelper.stopTrackingUserPosition();
            }
        };

        /* Public Methods END */

        /* Initialization START */

        getSettings();

        // Every time this view is entered, do some stuff.
        $scope.$on( "$ionicView.enter", function( scopes, states ) {

            if( states.fromCache && states.stateName == controllerStateName ) {

                // Get settings
                getSettings();
            }
        });

        /* Initialization END */

    }]);
})();
