/**
 * Created by jopes on 2016-01-08.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.dbBaseService',

        // Dependencies
        ['ngMap']
        )

        .service('dbBase', ["$q", "$cordovaSQLite", "$rootScope", function ($q, $cordovaSQLite, $rootScope) {

            // Init vars
            var that = this;
            var dbName = "app.db";
            var dbDeferred = $q.defer(); // DB level promise. Resolves when its ready for usage.

            // Service properties
            that.db = {};

            // Private methods
            var setupDefaultTables = function () {

                // Create promise
                var deferred = $q.defer();

                // Create settings table
                $cordovaSQLite.execute(that.db, "CREATE TABLE IF NOT EXISTS settings " +
                        "(" +
                        "id integer primary key, " +
                        "name text," +
                        "value text" +
                        ")"
                    )
                    .then(function () {

                        // Resolve promise
                        deferred.resolve();
                    });

                // Return promise
                return deferred.promise;

            };

            // Public methods

            that.getPromise = function () {
                return dbDeferred.promise;
            };

            that.setupTable = function (tableName, fieldNameArray, fieldTypeArray) {

                var queryStr, i, deferred;

                // Create promise
                deferred = $q.defer();

                // Check for invalid arguments
                if (
                    !Array.isArray(fieldNameArray) || !Array.isArray(fieldTypeArray) ||
                    fieldNameArray.length !== fieldTypeArray.length
                ) {
                    return false;
                }
                // Sanitize table name
                tableName = tableName.replace(/\W+/g, "");

                // Build query string, add id field as standard
                queryStr = "CREATE TABLE IF NOT EXISTS " + tableName + " (id integer primary key, ";

                // Loop through desired fields
                for (i = 0; i < fieldNameArray.length; i++) {

                    // Sanitize field values
                    queryStr += fieldNameArray[i].replace(/\W+/g, "") + " " + fieldTypeArray[i].replace(/\W+/g, "");

                    if (i !== fieldNameArray.length) {
                        queryStr += ", "
                    }
                }
                // End query string
                queryStr += ")";

                // Add table
                $cordovaSQLite.execute(that.db, queryStr)

                    .then(function () {
                        // Resolve promise
                        deferred.resolve();
                    });

                // Return promise
                return deferred.promise;
            };

            that.initDb = function () {

                // Create or open DB file
                that.db = $cordovaSQLite.openDB({name: dbName, location: 2});

                // Setup default tables if necessary
                setupDefaultTables()

                    .then(function () {

                        // Resolve promise
                        dbDeferred.resolve();
                    });

                // Return promise for db
                return dbDeferred.promise;
            };

        }]);
})();
