'use strict';

(function() {

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

      var addMarkersToMap = function(waitUntilMapsIsIdle){

          var displayContent;

          markerObjArray.forEach(function(markerObj){

              mapHelper.addMarkerToMap(markerObj.obj.location.coordinates[1], markerObj.obj.location.coordinates[0], waitUntilMapsIsIdle, function(){

                  $scope.activeMarker = markerObj;

              });
          })
      };

    /* Private Methods END */

    /* Public Methods START */

      $scope.showMarkerInfo = function(event, marker){

          // Set active marker
          $scope.activeMarker = marker;

          // Display info google maps window
          mapHelper.showInfoWindow(marker.obj._id);

      };

      $scope.openActiveMarkerWwwSource = function(){

          window.open($scope.activeMarker.obj.href);
      };

    /* Public Methods END */

    /* Initialization START */

      mapHelper.loadGoogleMaps()
          .then(function(){

              getMarkers().then(function(){

                  addMarkersToMap();

                  mapHelper.startTrackingUserPosition();

              });

          });

      // Every time this view is entered, do some stuff.
      $scope.$on( "$ionicView.enter", function( scopes, states ) {

          if( states.fromCache && states.stateName == controllerStateName ) {

              if(mapHelper.map !== {}){

                  getMarkers().then(function(){

                      addMarkersToMap(false);
                  })
              }
          }
      });

      // Every time this view is entered, do some stuff.
      $scope.$on( "$ionicView.leave", function( scopes, states ) {

          mapHelper.clearMarkers(markerObjArray);

      });

    /* Initialization END */

  }]);
})();

