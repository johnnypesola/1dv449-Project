'use strict';

(function() {

  angular.module('Climbspotter.chats',

    // Dependencies
    []
    )

    // Controller
    .controller('ChatsCtrl', ["$scope", "Chats", function ($scope, Chats) {

      $scope.chats = Chats.all();
      $scope.remove = function(chat) {
        Chats.remove(chat);
      };

      console.log("yeah?");

    }]);
})();
