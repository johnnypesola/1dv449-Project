'use strict';

(function(){

    // Declare module
    angular.module('Climbspotter.dbMarkerModel',

        // Dependencies
        []
    )

        .factory('DbMarker', ['$q', function ($q) {

            var DbMarker = function(id, eid, lat, lng, name, href, source, date, dis, type){

                var that = this;
                that.isPreparedForDb = false;

                // Arguments
                that.id = id || 0; // Internal id (To local db)
                that.eid = eid || ""; // External id (From external source)
                that.lat = lat || 0;
                that.lng = lng || 0;
                that.name = name || "";
                that.href = href || "";
                that.source = source || "";
                that.date = date || new Date();
                that.dis = dis || -1;
                that.type = type || "climbing";

                // Declare dbTable get only property
                Object.defineProperty(that, "dbTableName", {
                    get: function () {
                        return "marker";
                    }
                });
            };

            DbMarker.prototype.prepareForDb = function(){

                if(!this.isPreparedForDb){
                    this.date = this.date.getTime(); // To timestamp

                    this.isPreparedForDb = true;
                }
            };

            DbMarker.prototype.parseFromDb = function(){

                if(this.isPreparedForDb){
                    this.date = new Date(this.date); // From timestamp

                    this.isPreparedForDb = false;
                }
            };

            return DbMarker;
        }])

})();