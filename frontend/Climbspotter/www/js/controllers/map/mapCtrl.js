'use strict';

(function() {

  angular.module('Climbspotter.map',

    // Dependencies
    ['ngMap']
  )

  // Controller
  .controller('MapCtrl', ["$scope", "$state", "$q", "mapHelper", "NgMap", "Markers", function ($scope, $state, $q, mapHelper, NgMap, Markers) {

    // Declare variables
    var markerObjArray = [];

    // Private methods
    var getMarkers = function(){

        // Create promise
        var deferred = $q.defer();

        Markers.getAllServiceMarkersNear(
            {
                lat: mapHelper.userPosition.coords.latitude,
                lng: mapHelper.userPosition.coords.longitude
            }
        ).then(function(markers){

            // Store markers in array
            markerObjArray = markers;

            // Resolve promise
            deferred.resolve();
        });

        // Return promise
        return deferred.promise;
    };

    var addMarkersToMap = function(){

        markerObjArray.forEach(function(marker){

            mapHelper.addMarkerToMap(marker.obj.location.coordinates[1], marker.obj.location.coordinates[0])
                .then(function(marker) {
                    mapHelper.addInfoWindow("This is some content", marker, "click");
                });
        })
    };

    // Public methods


    // Init code

      mapHelper.loadGoogleMaps()
        .then(function(){

          getMarkers().then(function(){

              addMarkersToMap();
          });


          /*
          mapHelper.addMarkerToMap(59.32893, 18.06491)
            .then(function(markerObj) {
              mapHelper.addInfoWindow("This is some content", markerObj, "click");
            });

          mapHelper.addMarkerToMap(59.98914, 15.81664)
            .then(function(markerObj) {
              mapHelper.addInfoWindow("This is Fagersta.", markerObj, "click");
            });
          */

      });
  }]);
})();

