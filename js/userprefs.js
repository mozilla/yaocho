'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('SettingsCtrl', ['$scope', '$rootScope', 'KStorage',
function($scope, $rootScope, KStorage, NavCtrl) {
  $rootScope.ui = $rootScope.ui || {};
  $rootScope.ui.current = {title: 'Settings'};

  // These also serve as the defaults.
  $scope.settings = {
    product: {
      slug: 'firefox-os',
      title: 'Firefox OS',
    },
    locale: 'en-US',
  };

  $scope.clearCache = function() {
    KStorage.clear();
    $rootScope.$emit('flash', 'Cache cleared.');
  };

  $rootScope.settings = $scope.settings;
}]);
