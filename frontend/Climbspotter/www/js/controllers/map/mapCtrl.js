'use strict';

(function() {

  angular.module('Climbspotter.map',

    // Dependencies
    []
  )

  // Controller
  .controller('MapCtrl', ["$scope", "$state", "$q", "mapHelper", function ($scope, $state, $q, mapHelper) {

    // Declare variables


    // Public methods


    // Init code
      mapHelper.loadGoogleMaps()
        .then(function(){
          mapHelper.addMarkerToMap(59.32893, 18.06491)
            .then(function(markerObj) {
              mapHelper.addInfoWindow("This is some content", markerObj, "click");
            });

          mapHelper.addMarkerToMap(59.98914, 15.81664);


      });
  }]);
})();

