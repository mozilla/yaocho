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

yaocho.controller('CacheDownloadCtrl', ['$rootScope', '$scope', '$location', 'Kitsune',
'KitsuneCorpus', 'KStorage', 'cacheTopic',
function($rootScope, $scope, $location, Kitsune, KitsuneCorpus, KStorage, cacheTopic) {
  if ($location.$$path === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 5;

    $scope.update = function() {
      $scope.showCacheUpdate = false;
      $rootScope.loading = true;

      var productSlug = $rootScope.settings.product.slug;
      KStorage.fuzzySearchObjects('topic:')
      .then(function(topics) {
        console.log(topics);
        return Promise.all(topics.map(cacheTopic));
      })
      .then(function() {
          var finishMsg = gettext("Documents finished downloading.");
          $rootScope.loading = false;
          $rootScope.$emit('flash', finishMsg);
      });
    }

    $scope.hideCacheUpdate = function() {
        $scope.showCacheUpdate = false;
    }

    KStorage.numObjectsExist('document', minCached)
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
