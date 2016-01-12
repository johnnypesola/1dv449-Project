'use strict';

(function(){

    // Declare module
    angular.module('Climbspotter.dbMarkerModel',

        // Dependencies
        []
    )

        .factory('DbMarker', ['$q', function ($q) {

            var DbMarker = function(id, lat, lng, name, href, source, date, dis){
                var that = this;

                // Arguments
                that.id = id || 0;
                that.lat = lat || 0;
                that.lng = lng || 0;
                that.name = name || "";
                that.href = href || "";
                that.source = source || "";
                that.date = date || "";
                that.dis = dis || -1;
            };

            return DbMarker;
        }])

})();