'use strict';

var yaocho = angular.module('yaocho', [
  'url.manager',
  'ngRoute',
  'restangular',
  'LocalForageModule',
  'ngSanitize',
]);

yaocho.value('version', '0.1');

yaocho.config(['urlManagerProvider', '$localForageProvider', '$locationProvider',
function(urlManagerProvider, $localForageProvider, $locationProvider) {
  urlManagerProvider
    .addUrlPattern('TopicBrowserRoot', '/', {
      templateUrl: '/partials/topic_browser.html',
      controller: 'TopicBrowserCtrl',
      topics: '',
    })
    .addUrlPattern('TopicBrowser', '/:topic/', {
      templateUrl: '/partials/topic_browser.html',
      controller: 'TopicBrowserCtrl',
    })
    .addUrlPattern('DocumentView', '/doc/:slug', {
      templateUrl: '/partials/document.html',
      controller: 'DocumentCtrl',
    })
    .addUrlPattern('_', '/:locale/kb/:slug', {
      redirectTo: '/doc/:slug',
    })
    .otherwise({
      redirectTo: '/',
    });

  $localForageProvider.setDriver('localStorageWrapper');

  $locationProvider.html5Mode(true);
}]);
