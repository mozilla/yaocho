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
'KitsuneCorpus', 'KStorage', 'cacheDocs', 'cacheTopics',
function($rootScope, $scope, $location, Kitsune, KitsuneCorpus, KStorage, cacheDocs, cacheTopics) {
  if ($location.$$path === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 100;

    console.log("logging obj");

    $scope.update = function() {
      $scope.showCacheUpdate = false;
      $rootScope.loading = true;

      var productSlug = $rootScope.settings.product.slug;

      KitsuneCorpus.getSubTopics('/');

      // Update cache for all documents.
      Kitsune.documents.all({product: productSlug})
      .then(function(documents) {
          return cacheDocs(documents);
      })
      .then(function() {
        $rootScope.$apply(function() {
          //var finishMsg = gettext("Documents finished downloading.");
          var finishMsg = "Documents finished downloading.";
          $rootScope.loading = false;
          $rootScope.$emit('flash', finishMsg);
        });
      });
    }

    $scope.hideCacheUpdate = function() {
        $scope.showCacheUpdate = false;
    }

    KStorage.numObjectsExist('document', minCached)
    .then(function(exists) {
      /*
      $scope.confirmMessage = gettext("Download documents for offline use?");
      $scope.yesMsg = gettext("Yes");
      $scope.noMsg = gettext("No");
      */
      if (!exists) {
        $scope.showCacheUpdate = true;

        var confirmMessage = "Download documents for offline use?";
        $scope.confirmMessage = confirmMessage;

        var yesMsg = "Yes";
        $scope.yesMsg = yesMsg;

        var noMsg = "No";
        $scope.noMsg = noMsg;
      }
    });
  }
}]);


yaocho.controller('LoadingCtrl', ['$rootScope', '$scope',
function($rootScope, $scope) {
  
}]);
