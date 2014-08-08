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

yaocho.controller('CacheDownloadCtrl', ['$rootScope', '$scope', '$location', 'Kitsune', 'KitsuneCorpus', 'KStorage', 'cacheTopic', 'IndexedDbWrapper',
function($rootScope, $scope, $location, Kitsune, KitsuneCorpus, KStorage, cacheTopic, IndexedDbWrapper) {
  if ($location.path() === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 5;

    $scope.update = function() {
      $scope.showCacheUpdate = false;
      $rootScope.loading = true;

      var productSlug = $rootScope.settings.product.slug;
      KStorage.fuzzySearchObjects('topic:')
      .then(function(topics) {
        return Promise.all(topics.map(cacheTopic));
      })
      .then(function() {
          var finishMsg = gettext("Documents finished downloading.");
          $rootScope.loading = false;
          $rootScope.$emit('flash', finishMsg);
      });
    };

    $scope.hideCacheUpdate = function() {
        $scope.showCacheUpdate = false;
    };

    IndexedDbWrapper.numObjectsExist('document', minCached)
    .then(function(exists) {
      $scope.confirmMessage = gettext("Download documents for offline use?");
      $scope.yesMsg = gettext("Yes");
      $scope.noMsg = gettext("No");
      if (!exists) {
        $scope.showCacheUpdate = true;
      }
    });
  }
}]);
