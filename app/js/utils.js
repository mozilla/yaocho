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

yaocho.factory('downloadImageAsDataURI', [
function() {
  return function(url) {
    console.log('getting data uri for', url);
    return new Promise(function(resolve, reject) {
      var canvas = document.createElement('canvas');
      var img = document.createElement('img');
      img.setAttribute('crossorigin', 'anonymous');
      console.log(img);

      img.onload = function() {
        console.log('img.onload');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        console.log(canvas);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = function(err) {
        console.log('image.onerror');
        log('server failed', err);
        reject(err);
      };

      // Download the image.
      img.src = url;
    });
  };
}]);
