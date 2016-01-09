'use strict';

(function() {

  angular.module('Climbspotter.account',

    // Dependencies
    []
    )

    // Controller
    .controller('AccountCtrl', ["$scope", function ($scope) {

      $scope.settings = {
        enableFriends: true
      };

    }]);
})();
