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
}])
