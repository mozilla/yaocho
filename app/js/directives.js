'use strict';

var yaocho = angular.module('yaocho');

yaocho.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
