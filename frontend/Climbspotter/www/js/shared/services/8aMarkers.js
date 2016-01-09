/**
 * Created by jopes on 2016-01-08.
 */
(function() {
  // Declare module
  angular.module('Climbspotter.8aMarkersService',

    // Dependencies
    ['ngMap']
    )

    .service('8aMarkers', ["$q", "$http", "$rootScope", "dbBase", function ($q, $http, $rootScope, dbBase) {

      // Init vars
      var that = this;
      var apiUrl = 'http://api.pesola.se:8100/v1.0/markers/all-near';

      // Private methods

      var setupCache = function(){

        // If cache does not exist, create it.
        if (!CacheFactory.get(cacheName)) {

          CacheFactory.createCache(cacheName);
        }

        // Get data from cache
        cachedData = CacheFactory.get(cacheName)
      };

      var parseDate = function(dateStr){
        return new Date(parseInt(dateStr.substr(6)));
      };

      var totalPagesNum = 0;

      /* Private Methods END */

      /* Public Methods START */

      // Example of a JSON response from API
      /*
       [
       {
       "dis": 0,
       "obj": {
       "source": "8a",
       "href": "http://www.8a.nu/crags/Crag.aspx?CragId=28167",
       "name": "Ötztal",
       "__v": 0,
       "_id": "567e0500b4c698b52adb35d4",
       "location": {
       "coordinates": [
       10.900497436523438,
       47.20067703735144
       ],
       "type": "Point"
       },
       "date": "2015-12-26T03:09:52.651Z"
       }
       }
       ]
       */

      serviceMethods.getAll = function(pageNumber){

        var deferred, trafficMessagesToReturnArray = [],
          startEntryIndex, endEntryIndex;

        // Create promise
        deferred = $q.defer();

        // Fetch api result
        $http.get(apiUrl, {
            cache: cachedData,
            params: {
              format: 'json',
              sort: 'createddate',
              size: messagesToGet
            }
          })

          // All went good.
          .success(function(response){

            response.messages.forEach(function(msg){

              // Parse date variables
              msg.createddate = parseDate(msg.createddate);

              trafficMessagesToReturnArray.push(msg);
            });

            // Sort results after createddate
            trafficMessagesToReturnArray.sort(function(a,b){
              return new Date(b.createddate) - new Date(a.createddate);
            });

            // Update total pages variable
            totalPagesNum = Math.ceil(trafficMessagesToReturnArray.length / pageEntryCount);

            // Apply slicing to results with pagenum
            startEntryIndex = pageEntryCount * (pageNumber - 1);
            endEntryIndex = pageEntryCount * pageNumber;

            // Slice entries
            trafficMessagesToReturnArray = trafficMessagesToReturnArray.slice(startEntryIndex, endEntryIndex);

            // Return parsed array
            deferred.resolve(trafficMessagesToReturnArray);
          })

          // In case data cannot be fetched
          .error(function(){

            deferred.reject();
          });


        // Return promise
        return deferred.promise;
      };

      serviceMethods.getTotalPages = function(){
        return totalPagesNum;
      };

      serviceMethods.getCategories = function(){
        return {
          0: "Vägtrafik",
          1: "Kollektivtrafik",
          2: "Planerad störning",
          3: "Övrigt"
        }
      };

      /* Public Methods END */

      /* Initialization START */

      setupCache();

      /* Initialization END */

      return serviceMethods;


    }]);
})();
