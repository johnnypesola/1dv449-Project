'use strict';

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

(function () {

    // App Name
    var Climbspotter;

    // Declare app level module which depends on some components
    Climbspotter = angular.module('Climbspotter', [
        'ionic',
        'ngCordova',
        'Climbspotter.map',
        'Climbspotter.layers',
        'Climbspotter.settings',
        'Climbspotter.mapHelperService',
        'Climbspotter.dbBaseService',
        'Climbspotter.markersService',
        'Climbspotter.8aMarkersRepository',
        'Climbspotter.sverigeforarenMarkersRepository',
        'Climbspotter.sftMarkersRepository',
        'Climbspotter.geocoderService',
        'Climbspotter.dbMarkerModel'
    ]);

    Climbspotter.run(['$ionicPlatform', 'dbBase', '$rootScope', function ($ionicPlatform, dbBase, $rootScope) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }




            // Initialize local database for caching
            dbBase.initDb();

        });
    }]);

    Climbspotter.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:
            .state('tab.map', {
                url: '/map',
                views: {
                    'tab-map': {
                        templateUrl: 'templates/tab-map.html',
                        controller: 'MapCtrl'
                    }
                }
            })

            .state('tab.layers', {
                url: '/layers',
                views: {
                    'tab-layers': {
                        templateUrl: 'templates/tab-layers.html',
                        controller: 'LayersCtrl'
                    }
                }
            })

            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chatDetail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/map');

    }]);

})();
