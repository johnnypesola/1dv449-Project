/**
 * Created by jopes on 2016-01-08.
 */
(function () {
    // Declare module
    angular.module('Climbspotter.dbBaseService',

        // Dependencies
        []
        )

        .service('dbBase', ["$q", "$cordovaSQLite", "$rootScope", function ($q, $cordovaSQLite, $rootScope) {

            // Init vars
            var that = this;
            var dbName = "app.db";
            var dbDeferred = $q.defer(); // DB level promise. Resolves when its ready for usage.

            // Valid table names
            var validTableNames = [
                'settings',
                'markers'
            ];

            // Service properties
            that.db = {};

            // Private methods
            var setupDefaultTables = function () {

                var dbTableCreationPromisesArray = [];

                // Setup tables
                dbTableCreationPromisesArray.push(setupSettingsTable());
                dbTableCreationPromisesArray.push(setupMarkersTable());

                // Return promises
                return $q.all(dbTableCreationPromisesArray);
            };

            var setupSettingsTable = function(){

                // Create promise
                var deferred = $q.defer();

                // Create settings table
                $cordovaSQLite.execute(that.db, "CREATE TABLE IF NOT EXISTS setting " +
                        "(" +
                        "id integer primary key, " +
                        "name TEXT," +
                        "value TEXT" +
                        ")"
                    )
                    .then(function () {

                        console.log("SQLite: Created settings table");

                        // Resolve promise
                        deferred.resolve();
                    });

                // Return promise
                return deferred.promise;
            };

            var isValidTableOrFieldName = function(tableName) {

                return !(/[^a-zA-Z0-9_]/.test(tableName));
            };

            var isInvalidFieldNames = function(fieldsArray) {

                fieldsArray.some(function(fieldName){
                    return !isValidTableOrFieldName(fieldName);
                });
            };

            var buildInsertQuery = function(tableName, propertiesArray){

                // Build query
                return "INSERT OR IGNORE INTO " + tableName + " (" + propertiesArray.join(", ") + ") VALUES (" +

                    // Output values as = "?, ?, ?..." required for query
                    propertiesArray.map(function(){
                        return "?";
                    }).join(", ") +

                    ")";
            };

            var buildSelectQuery = function(tableName, propertiesArray, comparisonArray, andOrArray){

                var returnQuery = "";

                if(!Array.isArray(propertiesArray)) {

                    console.log("dbBase::buildSelectQuery(): propertiesArray should be an array.");

                    return returnQuery;
                }

                if(propertiesArray.length == 0){
                    returnQuery = "SELECT * FROM " + tableName;
                }
                else {
                    // Build query
                    returnQuery = "SELECT * FROM " + tableName + " WHERE ";

                    propertiesArray.forEach(function(prop, index){
                        // property >|=|< ? (AND|OR)
                        returnQuery += " " + prop + comparisonArray[index] + "? " +
                            (andOrArray.length >= index ? andOrArray[index] : "");
                    });

                    return returnQuery;

                    /*
                    propertiesArray.join(", ") + " VALUES (" +

                        // Output values as = "?, ?, ?..." required for query
                        propertiesArray.map(function(){
                            return "?";
                        }).join(", ") +

                        ")";
                    */
                }



                return returnQuery;
            };

            var setupMarkersTable = function(){

                // Create promise
                var deferred = $q.defer();

                /* Maps to the dbMarker model class */

                // Create settings table
                $cordovaSQLite.execute(that.db, "CREATE TABLE IF NOT EXISTS marker " +
                        "(" +
                        "id INTEGER PRIMARY KEY, " +
                        "eid TEXT, " +  // External source id
                        "lat REAL, " +
                        "lng REAL, " +
                        "name TEXT, " +
                        "href TEXT, " +
                        "source TEXT, " +
                        "date NUMERIC, " +
                        "dis REAL, " +
                        "UNIQUE(lat, lng)" + // Two markers having the exact same position cannot be stored in database.
                        ")"
                    )
                    .then(function () {

                        console.log("SQLite: Created markers table");

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


            that.querySelect = function(sqlQueryStr, valuesArray){

                var deferred, returnObjArray = [];

                // Create promise
                deferred = $q.defer();

                $cordovaSQLite.execute(that.db, sqlQueryStr, valuesArray).then(function (results) {

                    var i;

                    console.log("QUERY: ", results);
                    console.log(results.rows.length);

                    // Build proper results to return
                    for (i = 0; i < results.rows.length; i++) {

                        returnObjArray.push(results.rows.item(i));
                    }
                    // Resolve promise
                    deferred.resolve(returnObjArray);

                }, function (err) {

                    // Something went wrong
                    console.error(err);

                    deferred.reject("Could not select from DB");
                });

                return deferred.promise;
            };

            that.select = function(tableName, propertiesArray, comparisonArray, valuesArray, andOrArray){

                var query, deferred;

                // Create promise
                deferred = $q.defer();

                // Build query string
                query = buildSelectQuery(tableName, propertiesArray, comparisonArray, andOrArray);

                console.log("SELECT QUERY: ", query);

                $cordovaSQLite.execute(that.db, query, valuesArray).then(function (res) {

                    console.log(tableName + ": select", res);

                    // Resolve promise
                    deferred.resolve(res);

                }, function (err) {

                    // Something went wrong
                    console.error(err);

                    deferred.reject("Could not select from DB");
                });



            };

            that.insertMany = function(tableName, propertiesArray, objectsArray){

                var query, deferred, valueCollectionArray = [];

                // Create promise
                deferred = $q.defer();

                // Check that all arguments are ok.
                if(
                    isValidTableOrFieldName(tableName) &&
                    Array.isArray(propertiesArray) &&
                    propertiesArray.length > 0 &&
                    !isInvalidFieldNames(propertiesArray)
                )
                {
                    // Build valuesCollection from object properties.
                    objectsArray.forEach(function(obj){

                        var valuesArray = [];

                        // Prepare object values for DB
                        obj.prepareForDb();

                        propertiesArray.forEach(function(prop){

                            valuesArray.push(obj[prop]);
                        });

                        valueCollectionArray.push(valuesArray);
                    });

                    // Build query
                    query = buildInsertQuery(tableName, propertiesArray);

                    // Execute query
                    $cordovaSQLite.insertCollection(that.db, query, valueCollectionArray).then(function (res) {

                        console.log(tableName + ": insertCollection: insertId: ", res);

                        // Resolve promise
                        deferred.resolve(res.insertId);

                    }, function (err) {

                        // Something went wrong
                        console.error(err);

                        deferred.reject("Could not insert valid collection to DB");
                    });
                }
                else {

                    deferred.reject("Could not insert invalid collection to DB");
                }

                // Return promise
                return deferred.promise;
            };

            that.insert = function(tableName, propertiesArray, valuesArray) {

                var query, deferred;

                // Create promise
                deferred = $q.defer();

                // Check that all arguments are ok.
                if(
                    isValidTableOrFieldName(tableName) &&
                    Array.isArray(propertiesArray) &&
                    propertiesArray.length > 0 &&
                    !isInvalidFieldNames(propertiesArray)
                )
                {
                    // Build query
                    query = buildInsertQuery(tableName, propertiesArray);

                    // Execute query
                    $cordovaSQLite.execute(that.db, query, valuesArray).then(function (res) {

                        console.log(tableName + ": insertId: " + res.insertId);

                        // Resolve promise
                        deferred.resolve(res.insertId);

                    }, function (err) {

                        console.error(err);

                        deferred.reject("Could not insert valid object to DB");
                    });

                }
                else {

                    deferred.reject("Could not insert invalid object to DB");
                }
                // Return promise
                return deferred.promise;
            }
        }]);
})();
