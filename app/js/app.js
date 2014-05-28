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
    .addUrlPattern('TopicListView', '/:topics*?', {
      templateUrl: '/partials/topic_browser.html',
      controller: 'TopicBrowserCtrl',
    })
    .addUrlPattern('DocumentView', '/:topics*/doc/:slug', {
      templateUrl: '/partials/document.html',
      controller: 'DocumentCtrl',
    })
    .otherwise({
      redirectTo: '/',
    });

  $localForageProvider.setDriver('localStorageWrapper');

  $locationProvider.html5Mode(true);
}]);
