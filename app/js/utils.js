'use strict';

var yaocho = angular.module('yaocho');

yaocho.factory('safeApply', ['$rootScope',
function safeApply($rootScope) {
  // Modiefied from https://coderwall.com/p/ngisma
  return function(fn) {
    var phase = $rootScope.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn) {
        fn();
      }
    } else {
      $rootScope.$apply(fn);
    };
  };
}]);

yaocho.factory('updateCache', ['$rootScope', 'KitsuneCorpus', 'KStorage', 'cacheTopic',
function updateCache($rootScope, KitsuneCorpus, KStorage, cacheTopic) {
  return function() {
    // In case it's being shown.
    $rootScope.showCacheUpdate = false;
    $rootScope.loading = true;

    var product = $rootScope.settings.product.slug;
    var key = 'subtopics:' + null;
    KitsuneCorpus.getSubTopicPromise(key, product)
    .then(function() {
      return KStorage.fuzzySearchObjects('topic:')
    })
    .then(function(topics) {
      return Promise.all(topics.map(cacheTopic));
    })
    .then(function() {
      var finishMsg = gettext("Documents finished downloading.");
      $rootScope.loading = false;
      $rootScope.$emit('flash', finishMsg);
    });
  }
}]);

yaocho.factory('cacheTopic', ['Kitsune', 'KitsuneCorpus', 'KStorage', '$rootScope', 
function cacheTopic(Kitsune, KitsuneCorpus, KStorage, $rootScope) {
  return function(topic) {
    return Kitsune.documents.all({
      product: $rootScope.settings.product.slug,
      topic: topic.slug,
    })
    .then(function(docs) {
      var promises = [];
      var docKeys = docs.map(function(doc) {
          // Cache the doc while we're at it!
          promises.push(KitsuneCorpus.getDoc(doc.slug));
          return 'document:' + doc.slug;
      })
      var key = 'documents:' + topic.slug
      promises.push(KStorage.putSet(key, docKeys));
      return Promise.all(promises);
    });
  }
}]);

yaocho.factory('bindPromise', ['safeApply',
function bindPromise(safeApply) {
  return function($scope, name, promise) {
    safeApply(function(data) {
      $scope[name] = undefined;
    });

    promise.then(function(data) {
      safeApply(function() {
        $scope[name] = data;
      });
    });

    return promise;
  };
}]);

yaocho.directive('compile', ['$compile',
function compileDirective($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
         // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      },
      function(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);

        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    );
  };
}]);

yaocho.factory('downloadImageAsBlob', [
function() {
  return function(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      xhr.onload = function(e) {
        var arrayBufferView = new Uint8Array(this.response);
        var blob = new Blob([arrayBufferView], {type: "image/png"});
        resolve(blob);
      };

      xhr.onerror = function(e) {
        reject(e);
      };

      xhr.send();
    });
  };
}]);
