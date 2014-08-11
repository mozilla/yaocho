'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('SettingsCtrl', ['$scope', '$rootScope', 'IndexedDbWrapper',
function($scope, $rootScope, IndexedDBWrapper) {
  $rootScope.ui = $rootScope.ui || {};
  $rootScope.ui.current = {title: 'Settings'};

  $scope.clearCacheText = gettext('Clear Cache');

  // These also serve as the defaults.
  $scope.settings = {
    product: {
      slug: 'firefox-os',
      title: 'Firefox OS',
    },
    locale: 'en-US',
  };

  $scope.clearCache = function() {
    IndexedDBWrapper.clear();
    $rootScope.$emit('flash', gettext('Cache cleared.'));
  };

  $rootScope.settings = $scope.settings;
}]);
