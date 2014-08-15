'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('SettingsCtrl', ['$scope', '$rootScope', 'IndexedDbWrapper', 'cacheAll',
function($scope, $rootScope, IndexedDBWrapper, cacheAll) {
  $rootScope.ui = $rootScope.ui || {};
  $rootScope.ui.current = {title: 'Settings'};

  $scope.updateCacheText = gettext('Download All Documents');
  $scope.clearCacheText = gettext('Clear Cache');

  // These also serve as the defaults.
  $scope.settings = {
    product: {
      slug: 'firefox-os',
      title: 'Firefox OS',
    },
    locale: 'en-US',
  };

  $scope.updateCache = cacheAll;

  $scope.clearCache = function() {
    IndexedDBWrapper.clear();
    $rootScope.$emit('flash', gettext('Cache cleared.'));
  };

  $rootScope.settings = $scope.settings;
}]);
