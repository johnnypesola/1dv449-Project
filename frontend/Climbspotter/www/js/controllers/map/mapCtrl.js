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

      $scope.markersArray = [];
      $scope.activeMarker = {};

      // Private methods
      var getMarkers = function(){

          // Create promise
          var deferred = $q.defer();

          Markers.getAllMarkersNear(
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

          var displayContent;

          markerObjArray.forEach(function(markerObj){

              mapHelper.addMarkerToMap(markerObj.obj.location.coordinates[1], markerObj.obj.location.coordinates[0], function(){

                  $scope.activeMarker = markerObj;

              });
          })
      };

      // Public methods

      $scope.showMarkerInfo = function(event, marker){

          // Set active marker
          $scope.activeMarker = marker;

          // Display info google maps window
          mapHelper.showInfoWindow(marker.obj._id);

      };

      $scope.openActiveMarkerWwwSource = function(){

          window.open($scope.activeMarker.obj.href);
      };

      // Init code
      mapHelper.loadGoogleMaps()
          .then(function(){

              getMarkers().then(function(){

                  addMarkersToMap();
                  $scope.markersArray = markerObjArray;

                  mapHelper.startTrackingUserPosition();

                  //console.log($scope.markersArray);

              });

      });
  }]);
})();

