'use strict';

var yaocho = angular.module('yaocho', [
  'url.manager',
  'ngRoute',
  'restangular',
  'LocalForageModule',
  'ngSanitize',
]);

yaocho.value('version', '0.1');

yaocho.config(['urlManagerProvider',
function(urlManagerProvider) {
  urlManagerProvider
    .addUrlPattern('DocumentListView', '/', {
      templateUrl: '/partials/document_list.html',
      controller: 'DocumentListCtrl',
    })
    .addUrlPattern('DocumentView', '/kb/:slug', {
      templateUrl: '/partials/document.html',
      controller: 'DocumentCtrl',
    })
    .otherwise({
      redirectTo: '/',
    });
}]);

yaocho.config(function($locationProvider){
    $locationProvider.html5Mode(true);
});
