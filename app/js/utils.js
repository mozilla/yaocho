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

yaocho.factory('cacheDocs', ['KitsuneCorpus', 'KStorage',
function cacheDocs(KitsuneCorpus, KStorage) {
  return function(documents) {
    return Promise.all(documents.map(function(doc) {
      return KStorage.getObject('documents:' + doc.slug)
      .then(function() {
        console.log("documents: " + doc.slug + " already exists...");
      })
      .catch(function() {
        console.log(doc.slug + ": Added to cache!");
        return KitsuneCorpus.getDoc(doc.slug);
      })
    }));
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
