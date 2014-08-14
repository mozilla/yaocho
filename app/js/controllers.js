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

yaocho.controller('CacheDownloadCtrl', ['$rootScope', '$scope', '$location', 'Kitsune', 'KStorage', 'cacheTopic', 'IndexedDbWrapper',
function($rootScope, $scope, $location, Kitsune, KStorage, cacheTopic, IndexedDbWrapper) {
  if ($location.path() === "/") {
    // Minimum cached docs to not display caching suggestion.
    var minCached = 5;
    var product = $rootScope.settings.product.slug;

    $scope.update = function() {
      $scope.showCacheUpdate = false;
      $rootScope.loading = true;

      var queue = [{type: 'topic', slug: ''}];

      function downloadNext() {
        var next = queue.shift();
        return new Promise(function(resolve, reject) {
          if (next.type === 'topic') {
            KStorage.getObject('topic:' + product + '/' + next.slug, ['topicFromNetwork'])
            .then(function(topic) {
              topic.documents.forEach(function(st) {
                queue.push({type: 'document', slug: st.slug});
              });
              topic.subtopics.forEach(function(st) {
                queue.push({type: 'topic', slug: st.slug});
              });
              resolve();
            })

          } else if (next.type === 'document') {
            KStorage.getObject('document:' + next.slug, ['documentFromNetwork'])
            .then(function() {
              resolve();
            });

          } else {
            reject(new Error('Unknown object type "' + next.type + '" when downloading objects.'));
          }
        })
        .then(function() {
          if (queue.length) {
            return downloadNext();
          }
        });
      }

      return downloadNext()
      .then(function() {
        $rootScope.$apply(function() {
          var finishMsg = gettext("Documents finished downloading.");
          $rootScope.loading = false;
          $rootScope.$emit('flash', finishMsg);
        });
      })
      .catch(function(err) {
        console.error(err);
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
