'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  $scope.document = KitsuneCorpus.getDoc($routeParams.slug);
  $rootScope.ui.current = $scope.document;
}]);

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  if (!$routeParams.topic) {
    $rootScope.ui.backHidden = true;
  }

  $scope.topic = KitsuneCorpus.getTopic($routeParams.topic);
  $scope.subtopics = KitsuneCorpus.getSubTopics($routeParams.topic);
  $scope.documents = KitsuneCorpus.getTopicDocs($routeParams.topic);

  $rootScope.ui.current = $scope.topic;
}]);

yaocho.controller('CacheDownloadCtrl', ['$rootScope', '$scope', '$location', 'KStorage',
'updateCache',
function($rootScope, $scope, $location, KStorage, updateCache) {
  if ($location.path() === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 5;

    $scope.updateCache = updateCache;
    

    $scope.hideCacheUpdate = function() {
        $rootScope.showCacheUpdate = false;
    }

    KStorage.numObjectsExist('document:', minCached)
    .then(function(exists) {
      $scope.confirmMessage = gettext("Download documents for offline use?");
      $scope.yesMsg = gettext("Yes");
      $scope.noMsg = gettext("No");
      if (!exists) {
        $rootScope.showCacheUpdate = true;
      }
    });
  }
}]);
