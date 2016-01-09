'use strict';

(function() {

  angular.module('Climbspotter.chatDetail',

    // Dependencies
    []
    )

    // Controller
    .controller('ChatDetailCtrl', ["$scope", "$stateParams", "Chats", function ($scope, $stateParams, Chats) {

        $scope.chat = Chats.get($stateParams.chatId);

    }]);
})();
