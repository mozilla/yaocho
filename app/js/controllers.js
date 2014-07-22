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
'KStorage', 'cacheDocs',
function($rootScope, $scope, $location, Kitsune, KStorage, cacheDocs) {
  if ($location.$$path === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 5;

    KStorage.numObjectsExist('document', minCached)
      .catch(function() {
        var confirmMessage = "I see you don't have many documents cached, " +
          "would you like to download some now?";
        if (confirm(confirmMessage)) {
          var product = {'product': $rootScope.settings.product.slug};
          Kitsune.documents.all(product)
            .then(function(documents) {
              cacheDocs(documents);
          });
        }
    });
}
}]);
