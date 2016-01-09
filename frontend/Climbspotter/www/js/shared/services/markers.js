/**
 * Created by jopes on 2016-01-09.
 */
(function() {
  // Declare module
  angular.module('Climbspotter.markersService',

      // Dependencies
      ['ngMap']
      )

      .service('Markers', ["$q", "$rootScope", "$injector", function ($q, $rootScope, $injector) {

          /* Init vars */
          var that = this;

          // Declare services
          var markerServicesArray = [
              {
                  name: "8a",
                  initName: "8aMarkersRepo",
                  enabled:  true,
                  reference: {}
              }
          ];

          /* Private methods START */

          var injectEnabledServices = function(){

              that.getEnabledServices().forEach(function(service){

                  // Inject and store reference.
                  service.reference = $injector.get(service.initName);
              })
          };

          /* Private Methods END */

          /* Public Methods START */

          that.getEnabledServices = function(){

              var returnServiceArray = [];

              markerServicesArray.forEach(function(service){
                  if(service.enabled == true){
                      returnServiceArray.push(service);
                  }
              });

              return returnServiceArray;
          };

          that.disableService = function(serviceName){

              var serviceToDisable;

              serviceToDisable = markerServicesArray.find(function(service){
                  return service.name == serviceName;
              });

              // Set state to disabled
              serviceToDisable.enabled = false;
              // Delete reference
              delete serviceToDisable.reference;
          };

          that.enableService = function(serviceName){

              var serviceToEnable;

              serviceToEnable = markerServicesArray.find(function(service){
                  return service.name == serviceName;
              });

              // Inject and store reference.
              serviceToEnable.reference = $injector.get(serviceToEnable.initName);

              // Set state to enabled
              serviceToEnable.enabled = true;
          };

          that.getAllServiceMarkersNear = function(latLongObj){

              var returnMarkersArray = [],
                  deferred;

              // Create promise
              deferred = $q.defer();

              // Get all markers from enabled services. And concatinate into one array.
              that.getEnabledServices().forEach(function(service){

                  service.reference.getAllNear(latLongObj)
                      .then(function(markersArray){
                          returnMarkersArray = returnMarkersArray.concat(markersArray);

                          // Resolve promise
                          deferred.resolve(returnMarkersArray);
                      })
              });

              // Return promise
              return deferred.promise;
          };

          /* Public Methods END */

          /* Initialization START */

          injectEnabledServices();

          /* Initialization END */

      }]);
})();
