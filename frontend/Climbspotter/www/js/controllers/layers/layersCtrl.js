'use strict';

(function() {

  angular.module('Climbspotter.layers',

    // Dependencies
    []
    )

    // Controller
    .controller('LayersCtrl', ["$scope", "$state", function ($scope, $state) {

      $scope.settings = {
        wwwsverigeForaren: true,
        www8a: true
      };
    }]);
})();
