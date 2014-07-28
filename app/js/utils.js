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

yaocho.factory('cacheTopic', ['Kitsune', 'KitsuneCorpus', 'KStorage', '$rootScope', 
function cacheTopic(Kitsune, KitsuneCorpus, KStorage, $rootScope) {
  return function(topic) {
    return KStorage.getSet('documents:' + topic.slug)
      .then(function() {
        console.log("documents: " + topic.slug + " already exists...");
      })
      .catch(function() {
        return Kitsune.documents.all({
          product: $rootScope.settings.product.slug,
          topic: topic.slug,
        })
        .then(function(docs) {
          return Promise.all(docs.map(function(doc) {
            return new Promise(function(resolve, reject) {
              // Cache the doc while we're at it!
              KitsuneCorpus.getDoc(doc.slug);
              resolve('document:' + doc.slug);
            });
          }))
          .then(function(docKeys) {
            var key = 'documents:' + topic.slug
            console.log('adding subtopics:');
            console.log(docKeys);
            return KStorage.putSet(key, docKeys);
          });
        })
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
