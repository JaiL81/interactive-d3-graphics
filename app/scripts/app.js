'use strict';

/**
 * @ngdoc overview
 * @name interactiveD3App
 * @description
 * # interactiveD3App
 *
 * Main module of the application.
 */
angular
  .module('interactiveD3App', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'nvd3'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
