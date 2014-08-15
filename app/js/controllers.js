'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'KStorage',
function($rootScope, $scope, $routeParams, KStorage) {
  $scope.document = KStorage.getObject('document:' + $routeParams.slug).$$object;
  $rootScope.ui.current = $scope.document;
}]);

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'KStorage',
function($rootScope, $scope, $routeParams, KStorage) {
  if (!$routeParams.topic) {
    $rootScope.ui.backHidden = true;
  }
  var product = $rootScope.settings.product.slug;
  var topic = $routeParams.topic || '';
  var key = 'topic:' + product + '/' + topic;
  console.log('TopicBrowserCtrl', key);
  $scope.topic = KStorage.getObject(key).$$object;
  $rootScope.ui.current = $scope.topic;
}]);

yaocho.controller('CacheDownloadCtrl', ['$rootScope', '$scope', 'IndexedDbWrapper', 'cacheAll',
function($rootScope, $scope, IndexedDbWrapper, cacheAll) {
    // Minimum cached docs to not display caching suggestion.
  var minCached = 5;
  var product = $rootScope.settings.product.slug;

  $scope.update = function() {
    $scope.showCacheUpdate = false;
    cacheAll();
  };

  $scope.hideCacheUpdate = function() {
    $rootScope.showCacheUpdate = false;
  }

  IndexedDbWrapper.numObjectsExist('document', minCached)
  .then(function(exists) {
    $scope.confirmMessage = gettext("Download documents for offline use?");
    $scope.yesMsg = gettext("Yes");
    $scope.noMsg = gettext("No");
    if (!exists) {
      $rootScope.showCacheUpdate = true;
    }
  });
}]);
